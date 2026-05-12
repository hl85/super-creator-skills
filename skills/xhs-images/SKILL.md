---
name: xhs-images
description: Generates Xiaohongshu (Little Red Book) infographic series with 11 visual styles and 8 layouts. Breaks content into 1-10 cartoon-style images optimized for XHS engagement. Use when user mentions "小红书图片", "XHS images", "RedNote infographics", "小红书种草", or wants social media infographics for Chinese platforms.
version: 1.56.1
---

# Xiaohongshu Infographic Series

Breaks down content into eye-catching infographic series (2-10 images) optimized for Xiaohongshu.

## Usage

All commands use `./sc-run xhs-images <script>`. Note: Driven via prompt orchestration.

```bash
# Generate from article (auto-select)
./sc-run xhs-images main article.md

# Specify style and layout
./sc-run xhs-images main article.md --style notion --layout dense

# Use a preset
./sc-run xhs-images main article.md --preset knowledge-card

# Non-interactive mode
./sc-run xhs-images main article.md --yes
```

## Intents

- **Content Breakdown**: Map long-form content into a swipeable image series.
- **Style Application**: Apply XHS-native aesthetics (cute, fresh, notion, etc.).
- **Strategy-driven Outlining**: Choose between Story-driven, Info-dense, or Visual-first.

## Progressive Disclosure

For detailed style/layout galleries, presets, and strategy definitions, see:

- [references/galleries.md](references/galleries.md) - **Style, Layout & Preset Galleries**
- [references/workflow.md](references/workflow.md) - **Smart Confirm & Multi-Outline Workflow**
- [references/config/preferences-schema.md](references/config/preferences-schema.md) - **EXTEND.md Options**
- [references/workflows/analysis-framework.md](references/workflows/analysis-framework.md) - **Analysis Logic**

## See Also

需要对比所有视觉 skill 再做决定？→ [docs/visuals.md](../../docs/visuals.md)
