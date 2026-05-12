import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  CdpConnection,
  findChromeExecutable as findChromeExecutableBase,
  findExistingChromeDebugPort as findExistingChromeDebugPortBase,
  getFreePort as getFreePortBase,
  killChrome,
  launchChrome as launchChromeBase,
  resolveSharedChromeProfileDir,
  sleep,
  waitForChromeDebugPort,
  type PlatformCandidates,
} from 'sc-chrome-cdp';

export { CdpConnection, sleep, waitForChromeDebugPort };

export const CHROME_CANDIDATES: PlatformCandidates = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ],
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ],
  default: [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ],
};

const CHROME_LOCK_FILES = ['SingletonLock', 'SingletonSocket', 'SingletonCookie', 'chrome.pid'] as const;

function cleanStaleLockFiles(profileDir: string): void {
  for (const name of CHROME_LOCK_FILES) {
    try { fs.unlinkSync(path.join(profileDir, name)); } catch {}
  }
}

function hasLiveChromeOwner(profileDir: string): boolean {
  if (process.platform === 'win32') return false;
  try {
    const result = spawnSync('ps', ['aux'], {
      encoding: 'utf8',
      timeout: 5000,
    });
    if (result.status !== 0 || !result.stdout) return false;
    return result.stdout.split('\n').some((line) => line.includes(`--user-data-dir=${profileDir}`));
  } catch {
    return false;
  }
}

async function listProfileDirEntries(profileDir: string): Promise<string[]> {
  try {
    return await fs.promises.readdir(profileDir);
  } catch {
    return [];
  }
}

function hasChromeLockArtifacts(entries: readonly string[]): boolean {
  return CHROME_LOCK_FILES.some((name) => entries.includes(name));
}

let wslHome: string | null | undefined;
function getWslWindowsHome(): string | null {
  if (wslHome !== undefined) return wslHome;
  if (!process.env.WSL_DISTRO_NAME) {
    wslHome = null;
    return null;
  }
  try {
    const raw = execSync('cmd.exe /C "echo %USERPROFILE%"', {
      encoding: 'utf-8',
      timeout: 5_000,
    }).trim().replace(/\r/g, '');
    wslHome = execSync(`wslpath -u "${raw}"`, {
      encoding: 'utf-8',
      timeout: 5_000,
    }).trim() || null;
  } catch {
    wslHome = null;
  }
  return wslHome;
}

export function findChromeExecutable(chromePathOverride?: string): string | undefined {
  if (chromePathOverride?.trim()) return chromePathOverride.trim();
  return findChromeExecutableBase({
    candidates: CHROME_CANDIDATES,
    envNames: ['WEIBO_BROWSER_CHROME_PATH'],
  });
}

export async function findExistingChromeDebugPort(profileDir: string): Promise<number | null> {
  return await findExistingChromeDebugPortBase({ profileDir });
}

export function killChromeByProfile(profileDir: string): void {
  try {
    const result = spawnSync('ps', ['aux'], { encoding: 'utf-8', timeout: 5_000 });
    if (result.status !== 0 || !result.stdout) return;
    for (const line of result.stdout.split('\n')) {
      if (!line.includes(profileDir) || !line.includes('--remote-debugging-port=')) continue;
      const pid = line.trim().split(/\s+/)[1];
      if (pid) {
        try {
          process.kill(Number(pid), 'SIGTERM');
        } catch {}
      }
    }
  } catch {}
}

export function getDefaultProfileDir(): string {
  return resolveSharedChromeProfileDir({
    envNames: ['SC_CHROME_PROFILE_DIR', 'WEIBO_BROWSER_PROFILE_DIR'],
    wslWindowsHome: getWslWindowsHome(),
  });
}

export async function getFreePort(): Promise<number> {
  return await getFreePortBase('WEIBO_BROWSER_DEBUG_PORT');
}

async function launchChromeOnce(
  url: string,
  profileDir: string,
  chromePath: string,
): Promise<number> {
  const port = await getFreePort();
  const chrome = await launchChromeBase({
    chromePath,
    profileDir,
    port,
    url,
    extraArgs: ['--disable-blink-features=AutomationControlled', '--start-maximized'],
  });

  try {
    await waitForChromeDebugPort(port, 30_000, { includeLastError: true });
    return port;
  } catch (error) {
    killChrome(chrome);
    throw error;
  }
}

export async function launchChrome(url: string, profileDir: string, chromePathOverride?: string): Promise<number> {
  const chromePath = findChromeExecutable(chromePathOverride);
  if (!chromePath) throw new Error('Chrome not found. Set WEIBO_BROWSER_CHROME_PATH env var.');

  console.log(`[weibo-cdp] Launching Chrome (profile: ${profileDir})`);
  try {
    return await launchChromeOnce(url, profileDir, chromePath);
  } catch (error) {
    const entries = await listProfileDirEntries(profileDir);
    const lockArtifactsPresent = hasChromeLockArtifacts(entries);
    const hasLiveOwner = hasLiveChromeOwner(profileDir);

    if (lockArtifactsPresent && !hasLiveOwner) {
      console.warn(`[weibo-cdp] Stale lock files detected in ${profileDir}. Cleaning up and retrying...`);
      cleanStaleLockFiles(profileDir);
      return await launchChromeOnce(url, profileDir, chromePath);
    }

    throw error;
  }
}

export function getScriptDir(): string {
  return path.dirname(fileURLToPath(import.meta.url));
}

function runBunScript(scriptPath: string, args: string[]): boolean {
  const result = spawnSync('npx', ['-y', 'bun', scriptPath, ...args], { stdio: 'inherit' });
  return result.status === 0;
}

export function copyImageToClipboard(imagePath: string): boolean {
  const copyScript = path.join(getScriptDir(), 'copy-to-clipboard.ts');
  return runBunScript(copyScript, ['image', imagePath]);
}

export function copyHtmlToClipboard(htmlPath: string): boolean {
  const copyScript = path.join(getScriptDir(), 'copy-to-clipboard.ts');
  return runBunScript(copyScript, ['html', '--file', htmlPath]);
}

export function pasteFromClipboard(targetApp?: string, retries = 3, delayMs = 500): boolean {
  const pasteScript = path.join(getScriptDir(), 'paste-from-clipboard.ts');
  const args = ['--retries', String(retries), '--delay', String(delayMs)];
  if (targetApp) args.push('--app', targetApp);
  return runBunScript(pasteScript, args);
}
