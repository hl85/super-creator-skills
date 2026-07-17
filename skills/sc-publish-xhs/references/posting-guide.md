# Posting Guide — Xiaohongshu (CDP Automation)

## Overview

sc-publish-xhs uses Chrome CDP to automate the full publishing workflow: image upload, title/caption fill, tag insertion, and publish. The script is at `scripts/xhs-post.ts` and runs via Bun.

## Chrome CDP Prerequisites

sc-publish-xhs uses the same shared Chrome profile as sc-publish-wechat.

Profile path (macOS): `~/Library/Application Support/super-creator/chrome-profile`

### First-time login:
1. Run the script in preview mode (no `--publish` flag).
2. Chrome will launch and navigate to `https://creator.xiaohongshu.com/publish/publish`.
3. If not logged in, the script will navigate to `https://www.xiaohongshu.com` for manual login (scan QR code with XHS app).
4. After login, navigate back to the publish page. Cookies are persisted in the profile.

### Running the script

```bash
cd /path/to/skills/sc-publish-xhs/scripts
npx -y bun xhs-post.ts note \
  --title "标题" \
  --caption "正文" \
  --image ./img1.png --image ./img2.png \
  --tag 面试 --tag 求职 \
  --publish
```

## Note Composition Rules

| Field | Limit | Notes |
|-------|-------|-------|
| Title | ~20 chars | Short, catchy title |
| Caption | 1000 chars | Plain text; `#话题` inline for tags |
| Images | 1–9 | JPG/PNG/WebP; max 10MB each |
| Cover | 1 | Defaults to first image |
| Tags | up to 10 | Can be set via `--tag` flag |

## Image Upload Strategy

The script tries two approaches in order:

### Primary: DOM.setFileInputFiles
- Finds `<input type="file">` element via CDP DOM
- Sets files directly using `DOM.setFileInputFiles` CDP command
- More reliable — no clipboard or accessibility permissions needed
- Works for batch upload (all images at once)

### Fallback: Clipboard Paste
- Copies each image to clipboard via Swift (macOS) / xclip (Linux) / PowerShell (Windows)
- Clicks the upload area, then simulates Cmd+V / Ctrl+V
- Requires accessibility permissions on macOS

## Title & Caption Fill Strategy

Uses `Runtime.evaluate` with JavaScript to:
1. Find the element via multiple CSS selector fallbacks
2. For `<input>` / `<textarea>`: uses native setter + dispatches input/change events
3. For `contenteditable`: uses `document.execCommand('insertText')`

## Known Limitations

- XHS DOM structure may change; the script uses multiple selector fallbacks but may need updates
- Scheduled publishing not supported
- Video notes not supported (image notes only)
- Location tagging not yet automated
