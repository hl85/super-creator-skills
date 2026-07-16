# Regular Posts - Detailed Guide

Detailed documentation for posting text and images to X.

## Two Modes

### API v2 Mode (Recommended)

使用官方 X API v2 + OAuth 1.0a，稳定、快速、风险低。

```bash
# Post text
./sc-run post-to-x x-api "Hello from API!"

# Post with images
./sc-run post-to-x x-api "Check this out!" --image ./photo.png

# Post with multiple images (up to 4)
./sc-run post-to-x x-api "Gallery!" --image ./1.png --image ./2.png --image ./3.png --image ./4.png

# Use specific account
./sc-run post-to-x x-api "Hello!" --account work

# Check API configuration
./sc-run post-to-x x-api --check
```

**Advantages**:
- ✅ Official API, most stable
- ✅ No browser dependency
- ✅ Fast (HTTP request, seconds)
- ✅ Low risk of account issues

**Setup**: See [API Setup Guide](./api-setup.md)

---

### Browser CDP Mode (Fallback)

使用 Chrome CDP 浏览器自动化，功能更全但稳定性稍差。

```bash
# Post text and images
./sc-run post-to-x x-browser "Hello!" --image ./photo.png

# Quote an existing tweet
./sc-run post-to-x x-quote https://x.com/user/status/123 "Great insight!"
```

**Use when**:
- API not available
- Need features not supported by API (X Article, video, quote tweets)
- Testing browser automation

---

## Manual Workflow (Browser Mode)

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
- API mode: direct upload via media API
- Browser mode: copied to system clipboard, then pasted via keyboard shortcut

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

### API Mode Issues

- **Credentials not found**: Run `./sc-run post-to-x x-api --check` to verify
- **401 Unauthorized**: Check API Key and Access Token are correct and have write permission
- **429 Rate limited**: Free tier has ~1500 posts/month limit
- **403 Forbidden**: Access Token may not have write permission. Regenerate with Read/Write scope.

### Browser Mode Issues

- **Chrome not found**: Set `X_BROWSER_CHROME_PATH` environment variable
- **Not logged in**: First run opens Chrome - log in manually, cookies are saved
- **Image paste fails**:
  - On macOS, grant "Accessibility" permission to Terminal/iTerm in System Settings > Privacy & Security > Accessibility
  - Keep Chrome window visible and in front during paste operations
- **osascript permission denied**: Grant Terminal accessibility permissions in System Preferences
- **Rate limited**: Wait a few minutes before retrying

## How It Works

### API Mode

The `x-api.ts` script uses **X API v2** with **OAuth 1.0a** authentication:

1. Reads API credentials from environment variables or EXTEND.md
2. Uploads images via `upload.x.com/1.1/media/upload.json` (INIT → APPEND → FINALIZE)
3. Posts tweet via `api.x.com/2/tweets` with media_ids
4. Returns tweet ID and URL

### Browser Mode

The `x-browser.ts` script uses Chrome DevTools Protocol (CDP) to:

1. Launch real Chrome (not Playwright) with `--disable-blink-features=AutomationControlled`
2. Use persistent profile directory for saved login sessions
3. Interact with X via CDP commands (Runtime.evaluate, Input.dispatchKeyEvent)
4. **Paste images using osascript** (macOS): Sends real Cmd+V keystroke to Chrome, bypassing CDP's synthetic events that X can detect

This approach bypasses X's anti-automation detection that blocks Playwright/Puppeteer.
