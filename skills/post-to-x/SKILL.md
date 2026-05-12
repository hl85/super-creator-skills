---
name: post-to-x
description: Posts content and articles to X (Twitter). Supports regular posts with images/videos and X Articles (long-form Markdown). Uses real Chrome with CDP to bypass anti-automation. Use when user asks to "post to X", "tweet", "publish to Twitter", or "share on X".
version: 1.56.1
---

# Post to X (Twitter)

Posts text, images, videos, and long-form articles to X via real Chrome browser.

## High-Level Intents

| Intent | Command |
|--------|---------|
| **Regular Post** | `./sc-run post-to-x x-browser "Hello!" --image ./photo.png` |
| **Video Post** | `./sc-run post-to-x x-video "Check this out!" --video ./clip.mp4` |
| **Quote Tweet** | `./sc-run post-to-x x-quote https://x.com/status/123 "Comment"` |
| **X Article** | `./sc-run post-to-x x-article article.md` |
| **Check Env** | `./sc-run post-to-x x-browser --check` |
| **Thread from JSON** | `./sc-run post-to-x x-browser --thread thread.json` |

## Documentation

- [Regular Posts & Quote Tweets](./references/regular-posts.md)
- [Video Posts](./references/video.md)
- [X Articles](./references/articles.md)
- [Input: thread.json from markdown-to-thread](../markdown-to-thread/SKILL.md) — Use `markdown-to-thread` to slice a long article into thread JSON first.

## Self-Healing

If a script fails with `Chrome debug port not ready`, it will automatically attempt to kill existing Chrome instances and retry.

## Troubleshooting

- **Login**: First run requires manual login (session persists).
- **Permissions**: macOS requires Accessibility permission for terminal to paste images.
- **Chrome**: Close other Chrome instances if they use the same debug port (9222).
