import fs from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import path from 'node:path';

import {
  CHROME_CANDIDATES_FULL,
  CdpConnection,
  copyImageToClipboard,
  findExistingChromeDebugPort,
  getDefaultProfileDir,
  gracefulKillChrome,
  launchChrome,
  openPageSession,
  pasteFromClipboard,
  sleep,
  waitForChromeDebugPort,
  getScriptDir,
} from './xhs-utils.js';

const XHS_PUBLISH_URL = 'https://creator.xiaohongshu.com/publish/publish';

interface XhsPostOptions {
  title?: string;
  caption?: string;
  images?: string[];
  tags?: string[];
  publish?: boolean;
  timeoutMs?: number;
  profileDir?: string;
  chromePath?: string;
}

/**
 * Post an image-text note to Xiaohongshu via Chrome CDP automation.
 *
 * Flow:
 * 1. Launch Chrome with shared super-creator profile (or reuse existing session)
 * 2. Navigate to XHS creator center publish page
 * 3. Wait for login if needed
 * 4. Upload images via DOM.setFileInputFiles (fallback: clipboard paste)
 * 5. Fill title and caption
 * 6. Add tags if provided
 * 7. Click publish (or leave for manual review)
 */
export async function postToXhs(options: XhsPostOptions): Promise<void> {
  const {
    title,
    caption,
    images = [],
    tags = [],
    publish = false,
    timeoutMs = 120_000,
    profileDir = getDefaultProfileDir(),
  } = options;

  await mkdir(profileDir, { recursive: true });

  // 1. Find or launch Chrome
  const existingPort = await findExistingChromeDebugPort(profileDir);
  const reusing = existingPort !== null;
  let port = existingPort ?? 0;
  let chrome: Awaited<ReturnType<typeof launchChrome>>['chrome'] | null = null;

  if (!reusing) {
    const launched = await launchChrome(XHS_PUBLISH_URL, profileDir, CHROME_CANDIDATES_FULL, options.chromePath);
    port = launched.port;
    chrome = launched.chrome;
  }

  if (reusing) console.log(`[xhs-post] Reusing existing Chrome on port ${port}`);
  else console.log(`[xhs-post] Launched Chrome (profile: ${profileDir})`);

  let cdp: CdpConnection | null = null;
  let sessionId: string | null = null;

  try {
    // 2. Connect to CDP
    const wsUrl = await waitForChromeDebugPort(port, 30_000, { includeLastError: true });
    cdp = await CdpConnection.connect(wsUrl, 30_000, { defaultTimeoutMs: 15_000 });

    // 3. Open page session
    const page = await openPageSession({
      cdp,
      reusing,
      url: XHS_PUBLISH_URL,
      matchTarget: (target) =>
        target.type === 'page' && (target.url.includes('creator.xiaohongshu.com') || target.url.includes('xiaohongshu.com')),
      enablePage: true,
      enableRuntime: true,
      enableDom: true,
      enableNetwork: true,
    });
    sessionId = page.sessionId;

    console.log('[xhs-post] Waiting for XHS publish page...');

    // 4. Wait for the publish page to be ready
    const waitForPage = async (): Promise<boolean> => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const result = await cdp!.send<{ result: { value: boolean } }>(
          'Runtime.evaluate',
          {
            expression: `!!(
              document.querySelector('input[type="file"]') ||
              document.querySelector('[class*="upload"]') ||
              document.querySelector('[class*="publish"]') ||
              document.body?.innerText?.includes('上传图文')
            )`,
            returnByValue: true,
          },
          { sessionId },
        );
        if (result.result.value) return true;
        await sleep(1000);
      }
      return false;
    };

    const pageReady = await waitForPage();
    if (!pageReady) {
      console.log('[xhs-post] Publish page not found. Please log in to XHS in the browser window.');
      throw new Error('Timed out waiting for XHS publish page.');
    }

    console.log('[xhs-post] Publish page ready.');
    await sleep(2000);

    // 4.5 Click "上传图文" to switch to image-text mode (XHS defaults to video upload)
    console.log('[xhs-post] Clicking "上传图文" to switch to image-text mode...');
    await cdp.send('Runtime.evaluate', {
      expression: `
        // Find and click the "上传图文" tab/button
        const elements = Array.from(document.querySelectorAll('*'));
        const target = elements.find(el =>
          el.textContent?.trim() === '上传图文' &&
          el.children.length === 0 &&
          (el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'A' || el.tagName === 'BUTTON')
        );
        if (target) {
          target.click();
          console.log('Clicked 上传图文');
        } else {
          // Try clicking any element containing "上传图文"
          const alt = elements.find(el => el.textContent?.includes('上传图文') && el.children.length <= 2);
          if (alt) alt.click();
        }
      `,
    }, { sessionId });
    await sleep(3000);

    // 4.6 Now find the image file input (after switching to image-text mode)
    console.log('[xhs-post] Looking for image file input...');

    // 5. Upload images
    if (images.length > 0) {
      console.log(`[xhs-post] Uploading ${images.length} images...`);

      // Try DOM.setFileInputFiles approach (more reliable than clipboard)
      const uploaded = await uploadImagesViaFileInput(cdp, sessionId, images);

      if (!uploaded) {
        console.log('[xhs-post] File input approach failed, trying clipboard paste...');
        await uploadImagesViaClipboard(cdp, sessionId, images);
      }
    }

    // 6. Fill title
    if (title) {
      console.log('[xhs-post] Filling title...');
      await fillTitle(cdp, sessionId, title);
      await sleep(500);
    }

    // 7. Fill caption
    if (caption) {
      console.log('[xhs-post] Filling caption...');
      await fillCaption(cdp, sessionId, caption);
      await sleep(500);
    }

    // 8. Add tags
    if (tags.length > 0) {
      console.log(`[xhs-post] Adding ${tags.length} tags...`);
      for (const tag of tags) {
        await addTag(cdp, sessionId, tag);
        await sleep(300);
      }
    }

    // 9. Publish or preview
    if (publish) {
      console.log('[xhs-post] Clicking publish button...');
      await clickPublish(cdp, sessionId);
      await sleep(3000);
      console.log('[xhs-post] Note published!');
    } else {
      console.log('[xhs-post] Note composed. Please review and click the publish button in the browser.');
    }
  } finally {
    if (cdp) {
      cdp.close();
    }
    if (chrome) {
      if (!publish) {
        chrome.unref();
      } else {
        await gracefulKillChrome(chrome, port);
      }
    }
  }
}

/**
 * Upload images by finding the file input element and setting files via CDP.
 */
async function uploadImagesViaFileInput(
  cdp: CdpConnection,
  sessionId: string,
  images: string[],
): Promise<boolean> {
  // Wait for image file input to appear (after clicking 上传图文)
  let imageInputFound = false;
  const waitStart = Date.now();
  while (Date.now() - waitStart < 10_000) {
    const check = await cdp.send<{ result: { value: boolean } }>(
      'Runtime.evaluate',
      {
        expression: `!!(document.querySelector('input[type="file"][accept*="image"], input[type="file"][accept*="png"], input[type="file"][accept*="jpg"]') || (document.querySelector('input[type="file"]') && !document.querySelector('input[type="file"]')?.accept?.includes('mp4')))`,
        returnByValue: true,
      },
      { sessionId },
    );
    if (check.result.value) {
      imageInputFound = true;
      break;
    }
    await sleep(1000);
  }

  // Find the file input element via DOM
  const findResult = await cdp.send<{ root: { nodeId: number } }>('DOM.getDocument', {}, { sessionId });
  const rootNode = findResult.root.nodeId;

  // Search for image file input (prefer accept*="image", fallback to any file input that's not video-only)
  let searchResult = await cdp.send<{ nodeIds: number[] }>(
    'DOM.querySelectorAll',
    { nodeId: rootNode, selector: 'input[type="file"][accept*="image"], input[type="file"][accept*="png"], input[type="file"][accept*="jpg"]' },
    { sessionId },
  );

  if (searchResult.nodeIds.length === 0) {
    // Broader fallback: any file input that doesn't accept video
    searchResult = await cdp.send<{ nodeIds: number[] }>(
      'DOM.querySelectorAll',
      { nodeId: rootNode, selector: 'input[type="file"]' },
      { sessionId },
    );

    if (searchResult.nodeIds.length === 0) {
      console.warn('[xhs-post] No file input found after switching to image-text mode.');
      return false;
    }
  }

  const fileInputNode = searchResult.nodeIds[0];
  if (!fileInputNode) {
    console.warn('[xhs-post] File input node not found.');
    return false;
  }

  // Set files on the input element
  const validImages = images.filter((img) => {
    if (!fs.existsSync(img)) {
      console.warn(`[xhs-post] Image not found: ${img}`);
      return false;
    }
    return true;
  });

  if (validImages.length === 0) {
    console.warn('[xhs-post] No valid images to upload.');
    return false;
  }

  console.log(`[xhs-post] Setting ${validImages.length} files on input element...`);

  try {
    await cdp.send(
      'DOM.setFileInputFiles',
      {
        nodeId: fileInputNode,
        files: validImages,
      },
      { sessionId, timeoutMs: 30_000 },
    );

    // Wait for upload to complete
    console.log('[xhs-post] Waiting for images to upload...');
    await sleep(3000);

    // Verify upload by checking for image thumbnails
    const verifyResult = await cdp.send<{ result: { value: number } }>(
      'Runtime.evaluate',
      {
        expression: `document.querySelectorAll('img[src*="sns-img"], img[src*="xhscdn"], [class*="image-item"], [class*="upload-item"]').length`,
        returnByValue: true,
      },
      { sessionId },
    );

    if (verifyResult.result.value >= validImages.length) {
      console.log(`[xhs-post] ${validImages.length} images uploaded successfully.`);
      return true;
    }

    // Wait more and check again
    await sleep(5000);
    const recheck = await cdp.send<{ result: { value: number } }>(
      'Runtime.evaluate',
      {
        expression: `document.querySelectorAll('img[src*="sns-img"], img[src*="xhscdn"], [class*="image-item"], [class*="upload-item"]').length`,
        returnByValue: true,
      },
      { sessionId },
    );

    console.log(`[xhs-post] Image count after wait: ${recheck.result.value}`);
    return recheck.result.value >= validImages.length;
  } catch (error) {
    console.warn(`[xhs-post] DOM.setFileInputFiles failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Fallback: Upload images via clipboard paste.
 */
async function uploadImagesViaClipboard(
  cdp: CdpConnection,
  sessionId: string,
  images: string[],
): Promise<void> {
  for (const imagePath of images) {
    if (!fs.existsSync(imagePath)) {
      console.warn(`[xhs-post] Image not found: ${imagePath}`);
      continue;
    }

    console.log(`[xhs-post] Pasting image: ${imagePath}`);

    if (!copyImageToClipboard(imagePath)) {
      console.warn(`[xhs-post] Failed to copy image to clipboard: ${imagePath}`);
      continue;
    }

    await sleep(500);

    // Click on the upload area to focus it
    await cdp.send('Runtime.evaluate', {
      expression: `document.querySelector('[class*="upload"], [class*="drag"]')?.click()`,
    }, { sessionId });
    await sleep(200);

    const pasteSuccess = pasteFromClipboard('Google Chrome', 5, 500);

    if (!pasteSuccess) {
      const modifiers = process.platform === 'darwin' ? 4 : 2;
      await cdp.send('Input.dispatchKeyEvent', {
        type: 'keyDown',
        key: 'v',
        code: 'KeyV',
        modifiers,
        windowsVirtualKeyCode: 86,
      }, { sessionId });
      await cdp.send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key: 'v',
        code: 'KeyV',
        modifiers,
        windowsVirtualKeyCode: 86,
      }, { sessionId });
    }

    await sleep(2000);
  }
}

/**
 * Fill the title field.
 */
async function fillTitle(cdp: CdpConnection, sessionId: string, title: string): Promise<void> {
  // XHS title field selectors (try multiple — XHS uses dynamic class names)
  const titleSelectors = [
    '#title',
    'input[placeholder*="标题"]',
    'input[placeholder*="title"]',
    'input[placeholder*="填写"]',
    '[class*="title"] input',
    '[class*="title"] textarea',
    'div[contenteditable][class*="title"]',
    'div[contenteditable][data-placeholder*="标题"]',
    // XHS-specific: the title input after switching to image-text mode
    'input.d-input',
    'input[class*="titleInput"]',
    'input[class*="title-input"]',
  ];

  const expression = `
    (function() {
      const selectors = ${JSON.stringify(titleSelectors)};
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return sel;
      }
      return null;
    })()
  `;

  const result = await cdp.send<{ result: { value: string | null } }>(
    'Runtime.evaluate',
    { expression, returnByValue: true },
    { sessionId },
  );

  const foundSelector = result.result.value;
  if (!foundSelector) {
    console.warn('[xhs-post] Title field not found. Will try to set it via caption.');
    return;
  }

  // Focus and type the title
  await cdp.send('Runtime.evaluate', {
    expression: `
      const el = document.querySelector(${JSON.stringify(foundSelector)});
      if (el) {
        el.focus();
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
            || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(el, ${JSON.stringify(title)});
          } else {
            el.value = ${JSON.stringify(title)};
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (el.isContentEditable) {
          document.execCommand('selectAll', false);
          document.execCommand('insertText', false, ${JSON.stringify(title)});
        }
      }
    `,
  }, { sessionId });
}

/**
 * Fill the caption/body text.
 */
async function fillCaption(cdp: CdpConnection, sessionId: string, caption: string): Promise<void> {
  // XHS caption selectors (try multiple — XHS uses contenteditable or textarea)
  const captionSelectors = [
    '#caption',
    '#desc',
    'textarea[placeholder*="正文"]',
    'textarea[placeholder*="描述"]',
    'textarea[placeholder*="填写"]',
    'textarea[class*="caption"]',
    'textarea[class*="desc"]',
    'div[contenteditable][class*="caption"]',
    'div[contenteditable][class*="desc"]',
    'div[contenteditable][class*="content"]',
    'div[contenteditable][data-placeholder*="正文"]',
    'div[contenteditable][data-placeholder*="描述"]',
    'div[contenteditable]:not([class*="title"])',
    'textarea[class*="desc"]',
    // Broader: any contenteditable that's not the title
    'div[contenteditable="true"]:not([class*="title"])',
  ];

  const expression = `
    (function() {
      const selectors = ${JSON.stringify(captionSelectors)};
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return sel;
      }
      return null;
    })()
  `;

  const result = await cdp.send<{ result: { value: string | null } }>(
    'Runtime.evaluate',
    { expression, returnByValue: true },
    { sessionId },
  );

  const foundSelector = result.result.value;
  if (!foundSelector) {
    console.warn('[xhs-post] Caption field not found.');
    return;
  }

  // Focus and type the caption
  await cdp.send('Runtime.evaluate', {
    expression: `
      const el = document.querySelector(${JSON.stringify(foundSelector)});
      if (el) {
        el.focus();
        if (el.isContentEditable) {
          document.execCommand('selectAll', false);
          document.execCommand('insertText', false, ${JSON.stringify(caption)});
        } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
            || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(el, ${JSON.stringify(caption)});
          } else {
            el.value = ${JSON.stringify(caption)};
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    `,
  }, { sessionId });
}

/**
 * Add a topic tag.
 */
async function addTag(cdp: CdpConnection, sessionId: string, tag: string): Promise<void> {
  const tagText = tag.startsWith('#') ? tag : `#${tag}`;

  // Type the tag in the caption area (XHS auto-suggests topics when you type #)
  await cdp.send('Runtime.evaluate', {
    expression: `
      const caption = document.querySelector('[contenteditable][class*="caption"], [contenteditable][class*="desc"], [contenteditable]:not([class*="title"])');
      if (caption) {
        caption.focus();
        document.execCommand('insertText', false, ' ' + ${JSON.stringify(tagText)} + ' ');
      }
    `,
  }, { sessionId });

  await sleep(1000);

  // Try to click the first topic suggestion
  await cdp.send('Runtime.evaluate', {
    expression: `
      const suggestion = document.querySelector('[class*="topic-item"], [class*="tag-suggestion"], [class*="topic"] li');
      if (suggestion) suggestion.click();
    `,
  }, { sessionId });
}

/**
 * Click the publish button.
 */
async function clickPublish(cdp: CdpConnection, sessionId: string): Promise<void> {
  // Try multiple selectors for the publish button
  const publishExpressions = [
    `document.querySelector('button[class*="publish"]')?.click()`,
    `document.querySelector('button[class*="submit"]')?.click()`,
    `document.querySelector('[class*="publishBtn"]')?.click()`,
    `Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('发布'))?.click()`,
    `Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('发布笔记'))?.click()`,
    `Array.from(document.querySelectorAll('[class*="btn"]')).find(b => b.textContent?.includes('发布'))?.click()`,
  ];

  for (const expr of publishExpressions) {
    const result = await cdp.send<{ result: { value: boolean } }>(
      'Runtime.evaluate',
      {
        expression: `
          (function() {
            try {
              ${expr}
              return true;
            } catch {
              return false;
            }
          })()
        `,
        returnByValue: true,
      },
      { sessionId },
    );

    if (result.result.value) {
      console.log('[xhs-post] Publish button clicked.');
      return;
    }
  }

  console.warn('[xhs-post] Could not find publish button. Please click it manually.');
}

function printUsage(): never {
  console.log(`Publish to Xiaohongshu (小红书) using real Chrome browser

Usage:
  ./sc-run sc-publish-xhs note [options]

Options:
  --title <text>       Note title
  --caption <text>     Note body text (or use --caption-file)
  --caption-file <path> Read caption from file
  --image <path>       Add image (can be repeated, max 9)
  --tag <text>          Add topic tag (can be repeated, max 5)
  --publish             Actually publish (default: preview only)
  --profile <dir>      Chrome profile directory
  --check               Run environment verification
  --help                Show this help

Examples:
  ./sc-run sc-publish-xhs note --title "标题" --caption "正文" --image ./img1.png --image ./img2.png
  ./sc-run sc-publish-xhs note --title "标题" --caption-file caption.md --image ./img.png --publish
`);
  process.exit(0);
}

function runCheck(): void {
  const checkScript = path.join(getScriptDir(), 'check-paste-permissions.ts');
  if (fs.existsSync(checkScript)) {
    console.log('[xhs-post] Running environment check...');
    const result = spawnSync('npx', ['-y', 'bun', checkScript], { stdio: 'inherit' });
    process.exit(result.status ?? 0);
  } else {
    console.log('[xhs-post] Environment check not available. Checking Chrome...');
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(chromePath)) {
      console.log(`[xhs-post] Chrome found: ${chromePath}`);
    } else {
      console.error('[xhs-post] Chrome not found. Install Google Chrome.');
      process.exit(1);
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) printUsage();
  if (args.includes('--check')) runCheck();

  const images: string[] = [];
  const tags: string[] = [];
  let publish = false;
  let title: string | undefined;
  let caption: string | undefined;
  let captionFile: string | undefined;
  let profileDir: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === '--image' && args[i + 1]) {
      images.push(args[++i]!);
    } else if (arg === '--tag' && args[i + 1]) {
      tags.push(args[++i]!);
    } else if (arg === '--title' && args[i + 1]) {
      title = args[++i]!;
    } else if (arg === '--caption' && args[i + 1]) {
      caption = args[++i]!;
    } else if (arg === '--caption-file' && args[i + 1]) {
      captionFile = args[++i]!;
    } else if (arg === '--publish') {
      publish = true;
    } else if (arg === '--profile' && args[i + 1]) {
      profileDir = args[++i];
    }
  }

  // Read caption from file if specified
  if (captionFile) {
    caption = fs.readFileSync(captionFile, 'utf-8');
  }

  if (!title && !caption && images.length === 0) {
    console.error('Error: Provide at least a title, caption, or image.');
    process.exit(1);
  }

  await postToXhs({ title, caption, images, tags, publish, profileDir });
}

await main().catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
