---
name: post-to-xhs
description: Posts image-text notes (图文笔记) to Xiaohongshu (小红书 / RedNote / XHS) via Chrome CDP. Accepts a set of images (typically from xhs-images) and a caption, then publishes as a new note. Supports cover image selection, topic tags, and location tagging. [Beta] Use when user asks to "发小红书", "post to XHS", "发红书", "post to RedNote", or has xhs-images output ready to publish.
version: 0.1.0
---

# Post to Xiaohongshu (小红书)

Publishes image-text notes to Xiaohongshu via Chrome CDP browser automation.

## Usage

> ⚠️ **Beta** — 此 skill 通过 Claude 对话调用（prompt 驱动），以下 CLI 命令仅作参考，尚未实现。

This skill is driven via prompt orchestration. Provide your images and caption text in the conversation.

```bash
# [示例，暂不可用]
# ./sc-run post-to-xhs note --images ./output/*.png --caption caption.md
# ./sc-run post-to-xhs note --images img1.png,img2.png --caption "正文内容" --tags "AI,效率"
```

## Intents

- **图文笔记**: Upload up to 9 images with caption text, tags, and optional location.
- **封面选择**: Set a specific image as the cover (default: first image).
- **话题标签**: Add hashtag topics (`#话题`) for discoverability.
- **草稿模式**: Stage for review before publishing (default behavior).

## Workflow

1. Open Xiaohongshu creator center via Chrome CDP (requires login — first run opens browser).
2. Upload images in order.
3. Fill caption with user-provided text.
4. Add tags and location if specified.
5. Preview and confirm before publishing (unless `--publish` flag present).

## Progressive Disclosure

- [references/posting-guide.md](references/posting-guide.md) - **Step-by-step posting logic & Chrome CDP notes**
- [references/preferences.md](references/preferences.md) - **EXTEND.md & first-time Chrome login**
