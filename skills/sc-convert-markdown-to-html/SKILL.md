---
name: sc-convert-markdown-to-html
description: Converts Markdown to styled HTML with WeChat-compatible themes. Supports code highlighting, math, PlantUML, footnotes, alerts, infographics, and optional bottom citations for external links. **注意：在 sc-pipeline 中，sc-publish-wechat 会自动处理 Markdown 转 HTML，无需单独调用本 skill。仅在需要单独获取 HTML 文件时使用。** Use when user asks for "markdown to html", "convert md to html", "md 转 html", "微信外链转底部引用", or needs styled HTML output from markdown.
version: 1.56.1
---

# Convert Markdown to HTML

Converts Markdown to styled HTML with inline CSS, optimized for WeChat and professional sharing.

> **注意**: 在 sc-pipeline 中，sc-publish-wechat 会自动处理 Markdown 转 HTML，无需单独调用本 skill。仅在需要单独获取 HTML 文件时使用。

## Usage

All commands use `./sc-run sc-convert-markdown-to-html main`.

```bash
# Standard conversion (default theme)
./sc-run sc-convert-markdown-to-html main article.md

# Specific theme and color
./sc-run sc-convert-markdown-to-html main article.md --theme grace --color rose

# Enable bottom citations (WeChat friendly)
./sc-run sc-convert-markdown-to-html main article.md --cite
```

## Intents

- **Styled Conversion**: Transform Markdown into themed HTML (Grace, Simple, Modern).
- **Citation Localization**: Convert external links into 문末 references (Bottom Citations).
- **Format Verification**: Auto-suggest formatting via `sc-format-markdown` for Chinese content.

## Progressive Disclosure

For detailed theme galleries, citation rules, and supported Markdown features, see:

- [references/themes-and-features.md](references/themes-and-features.md) - **Theme List & Supported Syntax**
- [references/preferences.md](references/preferences.md) - **EXTEND.md & Color Presets**
- [references/technical-details.md](references/technical-details.md) - **JSON Output & Conflict Handling**
