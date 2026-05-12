# Regular Posts - Detailed Guide

Detailed documentation for posting text and images to X.

## Main Commands

```bash
# Post text and images
./sc-run post-to-x x-browser "Hello!" --image ./photo.png

# Quote an existing tweet
./sc-run post-to-x x-quote https://x.com/user/status/123 "Great insight!"
```

## Manual Workflow

If you prefer step-by-step control:

### Step 1: Copy Image to Clipboard

```bash
./sc-run post-to-x copy-to-clipboard image /path/to/image.png
```

### Step 2: Paste from Clipboard

```bash
# Simple paste to frontmost app
./sc-run post-to-x paste-from-clipboard

# Paste to Chrome with retries
./sc-run post-to-x paste-from-clipboard --app "Google Chrome" --retries 5

# Quick paste with shorter delay
./sc-run post-to-x paste-from-clipboard --delay 200
```

## Image Support

- Formats: PNG, JPEG, GIF, WebP
- Max 4 images per post
- Images copied to system clipboard, then pasted via keyboard shortcut

## Quote Tweets

Quote an existing tweet with comment.

```bash
./sc-run post-to-x x-quote https://x.com/user/status/123 "Great insight!"
```

**Parameters**:
| Parameter | Description |
|-----------|-------------|
| `<tweet-url>` | URL to quote (positional) |
| `<comment>` | Comment text (positional, optional) |
| `--profile <dir>` | Custom Chrome profile |

## Troubleshooting

- **Chrome not found**: Set `X_BROWSER_CHROME_PATH` environment variable
- **Not logged in**: First run opens Chrome - log in manually, cookies are saved
- **Image paste fails**:
  - On macOS, grant "Accessibility" permission to Terminal/iTerm in System Settings > Privacy & Security > Accessibility
  - Keep Chrome window visible and in front during paste operations
- **osascript permission denied**: Grant Terminal accessibility permissions in System Preferences
- **Rate limited**: Wait a few minutes before retrying

## How It Works

The `x-browser.ts` script uses Chrome DevTools Protocol (CDP) to:
1. Launch real Chrome (not Playwright) with `--disable-blink-features=AutomationControlled`
2. Use persistent profile directory for saved login sessions
3. Interact with X via CDP commands (Runtime.evaluate, Input.dispatchKeyEvent)
4. **Paste images using osascript** (macOS): Sends real Cmd+V keystroke to Chrome, bypassing CDP's synthetic events that X can detect

This approach bypasses X's anti-automation detection that blocks Playwright/Puppeteer.
