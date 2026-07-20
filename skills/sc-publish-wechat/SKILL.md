---
name: sc-publish-wechat
description: Publishes content to WeChat Official Account (微信公众号) via API or Chrome CDP. Supports article posting (文章) with Markdown or plain text input (HTML also supported for advanced use), and image-text posting (贴图, formerly 图文) with multiple images. **Directly pass .md files — Markdown-to-HTML conversion is handled internally; you do NOT need to call sc-convert-markdown-to-html first.** Markdown article workflows default to converting ordinary external links into bottom citations for WeChat-friendly output. Use when user mentions "发布公众号", "post to wechat", "微信公众号", or "贴图/图文/文章".
version: 1.56.1
---

# Publish to WeChat Official Account

## Intents

- **Article Posting**: Publish Markdown or plain text as an article (文章). HTML input also supported for advanced use.
- **Image-Text Posting**: Publish short posts with up to 9 images (贴图/图文).
- **Multi-Account**: Manage and switch between multiple WeChat accounts.
- **手动兜底**: API 和 Browser 方式都失败时，生成 PUBLISH-MANUAL.md 供用户手动发布

## Usage

All commands use `./sc-run sc-publish-wechat <script>`.

```bash
# Article via API (Recommended) — pass .md directly, HTML conversion is automatic
./sc-run sc-publish-wechat wechat-api <file.md> --theme default

# Article via Browser — pass .md directly, HTML conversion is automatic
./sc-run sc-publish-wechat wechat-article --markdown <file.md>

# Image-Text post
./sc-run sc-publish-wechat wechat-browser --markdown <file.md> --images ./images/

# Check environment
./sc-run sc-publish-wechat check-permissions
```

> **Note**: Do NOT pre-convert Markdown to HTML using sc-convert-markdown-to-html before calling this skill. Pass the `.md` file directly — the internal conversion ensures correct image handling (API upload vs. browser paste workflow) and proper WeChat formatting.

## Progressive Disclosure

For detailed workflows, preferences, and technical details, see:

- [references/article-workflow.md](references/article-workflow.md) - **Article Posting Step-by-Step**
- [references/image-text-posting.md](references/image-text-posting.md) - **Short Post Details**
- [references/preferences.md](references/preferences.md) - **EXTEND.md & Configuration**
- [references/multi-account.md](references/multi-account.md) - **Multi-Account Support**
- [references/technical-details.md](references/technical-details.md) - **Troubleshooting & Comparison**
- [references/config/first-time-setup.md](references/config/first-time-setup.md) - **Guided Setup**

## Chrome Setup

首次使用需要配置 Chrome CDP。完整步骤：[references/chrome-setup.md](references/chrome-setup.md)
