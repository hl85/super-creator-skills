---
name: xhs-images
description: Generates Xiaohongshu (小红书 / RedNote / XHS) infographic series with 11 visual styles and 8 layouts. Breaks content into 1-10 cartoon-style images optimized for XHS engagement. Use when user mentions "小红书图片", "XHS images", "RedNote infographics", "小红书种草", "xhs-images", or wants social media infographics for Chinese platforms.
version: 1.56.1
---

# Xiaohongshu Infographic Series

Breaks down content into eye-catching infographic series (2-10 images) optimized for Xiaohongshu.

## Usage

All commands use `./sc-run xhs-images <script>`. Image generation is delegated to the available image generation skill (default: `imagine`). If multiple image generation skills are available, ask the user to choose; if none are available, prompt the user to configure an API Key or install an image generation skill.

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
- [references/workflows/overview.md](references/workflows/overview.md) - **Workflow Overview & Input Methods**
- [references/workflows/writeflow-input.md](references/workflows/writeflow-input.md) - **Writeflow Skill Integration**
- [references/workflows/analysis-framework.md](references/workflows/analysis-framework.md) - **Analysis Logic**
- [references/workflows/outline-template.md](references/workflows/outline-template.md) - **Outline Template**
- [references/workflows/prompt-assembly.md](references/workflows/prompt-assembly.md) - **Prompt Assembly Guide**
- [references/config/preferences-schema.md](references/config/preferences-schema.md) - **EXTEND.md Options**

## Documentation

- [Full Workflow](references/workflows/overview.md)
- [Image Generation Convention](references/image-generation-convention.md) - **Image Generation Backend Convention**

## See Also

需要对比所有视觉 skill 再做决定？→ [视觉 Skill 选择指南](references/visual-skills-guide.md)

## Error Handling

See [references/error-handling.md](references/error-handling.md) for API key recovery steps and SVG fallback strategy.
