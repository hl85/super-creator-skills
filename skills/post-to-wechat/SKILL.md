---
name: post-to-wechat
description: Posts content to WeChat Official Account (微信公众号) via API or Chrome CDP. Supports article posting (文章) with HTML, markdown, or plain text input, and image-text posting (贴图, formerly 图文) with multiple images. Markdown article workflows default to converting ordinary external links into bottom citations for WeChat-friendly output. Use when user mentions "发布公众号", "post to wechat", "微信公众号", or "贴图/图文/文章".
version: 1.56.1
---

# Post to WeChat Official Account

## Intents

- **Article Posting**: Publish Markdown, HTML, or plain text as an article (文章).
- **Image-Text Posting**: Publish short posts with up to 9 images (贴图/图文).
- **Multi-Account**: Manage and switch between multiple WeChat accounts.

## Usage

All commands use `./sc-run post-to-wechat <script>`.

```bash
# Article via API (Recommended)
./sc-run post-to-wechat wechat-api <file> --theme default

# Article via Browser
./sc-run post-to-wechat wechat-article --markdown <file>

# Image-Text post
./sc-run post-to-wechat wechat-browser --markdown <file> --images ./images/

# Check environment
./sc-run post-to-wechat check-permissions
```

## Progressive Disclosure

For detailed workflows, preferences, and technical details, see:

- [references/article-workflow.md](references/article-workflow.md) - **Article Posting Step-by-Step**
- [references/image-text-posting.md](references/image-text-posting.md) - **Short Post Details**
- [references/preferences.md](references/preferences.md) - **EXTEND.md & Configuration**
- [references/multi-account.md](references/multi-account.md) - **Multi-Account Support**
- [references/technical-details.md](references/technical-details.md) - **Troubleshooting & Comparison**
- [references/config/first-time-setup.md](references/config/first-time-setup.md) - **Guided Setup**

## Chrome Setup

首次使用需要配置 Chrome CDP。完整步骤：[docs/chrome-setup.md](../../docs/chrome-setup.md)
