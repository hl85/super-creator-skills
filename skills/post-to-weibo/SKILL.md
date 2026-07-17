---
name: post-to-weibo
description: Posts content to Weibo (微博). Supports regular posts with text, images, and videos, and headline articles (头条文章) with Markdown input via Chrome CDP. Use when user mentions "发微博", "post to weibo", "微博头条文章".
version: 1.56.1
---

# Post to Weibo

## Intents

- **Regular Post**: Quick text update with up to 18 images or videos.
- **Headline Article**: Long-form Markdown article (头条文章) with cover and summary.
- **Post Selection**: Automatic detection of post type based on input (Markdown vs Text).

## Usage

All commands use `./sc-run post-to-weibo <script>`.

```bash
# Regular post (Text + Image)
./sc-run post-to-weibo weibo-post "Post content" --image ./img.png

# Headline Article (Markdown)
./sc-run post-to-weibo weibo-article article.md --cover ./cover.jpg
```

## Progressive Disclosure

For detailed information on posting types, preferences, and troubleshooting, see:

- [references/posting-types.md](references/posting-types.md) - **Regular Posts & Headline Articles**
- [references/preferences.md](references/preferences.md) - **EXTEND.md & Prerequisites**
- [references/troubleshooting.md](references/troubleshooting.md) - **Common Issues & Fixes**

## Chrome Setup

首次使用需要配置 Chrome CDP。完整步骤：[references/chrome-setup.md](references/chrome-setup.md)
