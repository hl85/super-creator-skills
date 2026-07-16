---
name: post-to-x
description: Posts content and articles to X (Twitter). Supports API v2 (recommended) and browser CDP fallback. Handles regular posts with images/videos, X Articles, and quote tweets. Auto-selects best available method. Use when user asks to "post to X", "tweet", "publish to Twitter", or "share on X".
version: 2.0.0
---

# Post to X (Twitter)

Posts text, images, videos, and long-form articles to X via **official API v2** (recommended) with browser CDP fallback.

## High-Level Intents

| Intent | Command |
|--------|---------|
| **Regular Post (API)** | `./sc-run post-to-x x-api "Hello!" --image ./photo.png` |
| **Regular Post (Browser)** | `./sc-run post-to-x x-browser "Hello!" --image ./photo.png` |
| **Video Post** | `./sc-run post-to-x x-video "Check this out!" --video ./clip.mp4` |
| **Quote Tweet** | `./sc-run post-to-x x-quote https://x.com/status/123 "Comment"` |
| **X Article** | `./sc-run post-to-x x-article article.md` |
| **Check Env** | `./sc-run post-to-x x-api --check` |
| **Thread from JSON** | `./sc-run post-to-x x-api --thread thread.json` |

## Two Publishing Modes

| Mode | Method | Stability | Risk | Setup Required |
|------|--------|-----------|------|----------------|
| **API v2 (推荐)** | Official X API v2 + OAuth 1.0a | ⭐⭐⭐⭐⭐ | 🟢 低 | API Key + Access Token |
| **Browser CDP** | Chrome DevTools Protocol | ⭐⭐⭐ | 🟡 中 | Chrome + 手动登录 |

**自动选择逻辑**：
1. 配置了 API 凭证 → 优先用 API v2
2. 没有 API 凭证 → 自动降级到 CDP 浏览器模式
3. 可以用 `--method api` / `--method browser` 强制指定

## Documentation

- [Regular Posts & Quote Tweets](./references/regular-posts.md)
- [Video Posts](./references/video.md)
- [X Articles](./references/articles.md)
- [API Setup Guide](./references/api-setup.md)
- [Input: thread.json from markdown-to-thread](../markdown-to-thread/SKILL.md)

## Self-Healing

If a script fails with `Chrome debug port not ready`, it will automatically attempt to kill existing Chrome instances and retry.

## Troubleshooting

- **API credentials missing**: See [API Setup Guide](./references/api-setup.md)
- **Login**: Browser mode first run requires manual login (session persists).
- **Permissions**: macOS requires Accessibility permission for terminal to paste images.
- **Chrome**: Close other Chrome instances if they use the same debug port (9222).

> 完整 Chrome 首次配置流程：[docs/chrome-setup.md](../../docs/chrome-setup.md)
