---
name: cover-image
description: Generates article cover images with 5 dimensions (type, palette, rendering, text, mood) combining 10 color palettes and 7 rendering styles. Supports cinematic (2.35:1), widescreen (16:9), and square (1:1) aspects. Use when user asks to "generate cover image", "create article cover", or "make cover".
version: 1.56.1
---

# Cover Image Generator

Generates elegant cover images with 5-dimensional customization (Type, Palette, Rendering, Text, Mood, Font).

## Usage

All commands use `./sc-run cover-image <script>`. Image generation is delegated to the available image generation skill (default: `imagine`). If multiple image generation skills are available, ask the user to choose; if none are available, prompt the user to configure an API Key or install an image generation skill.

```bash
# Generate cover for an article
./sc-run cover-image cover article.md

# Quick mode (skip confirmation)
./sc-run cover-image cover article.md --quick

# Specify dimensions
./sc-run cover-image cover article.md --palette warm --rendering flat-vector
```

## Intents

- **Cover Generation**: Create a visual anchor for articles.
- **Style Customization**: Fine-tune palettes, renderings, and typography.
- **Reference-based Style**: Extract and apply style from reference images.

## Progressive Disclosure

For detailed technical specifications, dimensions, and workflow rules, see:

- [references/technical-spec.md](references/technical-spec.md) - **Full Technical Documentation**
- [references/workflow/](references/workflow/) - **Workflow & Confirmation Rules**
- [references/workflow/image-generation-convention.md](references/workflow/image-generation-convention.md) - **Image Generation Backend Convention**
- [references/palettes/](references/palettes/) - **Color Palette Gallery**
- [references/renderings/](references/renderings/) - **Rendering Styles Gallery**
- [references/types.md](references/types.md) - **Image Type Definitions**

## See Also

需要对比所有视觉 skill 再做决定？→ [视觉 Skill 选择指南](references/visual-skills-guide.md)

## Error Handling

See [references/error-handling.md](references/error-handling.md) for API key recovery steps and SVG fallback strategy.
