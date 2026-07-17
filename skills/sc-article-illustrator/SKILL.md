---
name: sc-article-illustrator
description: Analyzes article structure, identifies positions requiring visual aids, generates illustrations with Type × Style two-dimension approach. Use when user asks to "illustrate article", "add images", "generate images for article", or "为文章配图".
version: 1.57.0
---

# Article Illustrator

Analyze articles, identify illustration positions, and generate images with Type × Style consistency.

## Usage

All commands use `./sc-run sc-article-illustrator <script>`. Image generation is delegated to the available image generation skill (default: `sc-imagine`). If multiple image generation skills are available, ask the user to choose; if none are available, prompt the user to configure an API Key or install an image generation skill.

```bash
# Analyze article and generate outline
./sc-run sc-article-illustrator build-batch --input path/to/article.md

# Generate images from saved prompts in batch mode
./sc-run sc-imagine build-batch --batchfile output-dir/prompts/batch.json
```

## Quick Reference

- **Type**: infographic, scene, flowchart, comparison, framework, timeline
- **Style**: notion, warm, minimal, blueprint, watercolor, elegant
- **Presets**: `--preset tech-explainer` (See [Style Presets](references/style-presets.md))

## Documentation

- [Workflow & Procedures](references/workflow.md)
- [Style Gallery](references/styles.md)
- [Prompt Templates](references/prompt-construction.md)
- [CLI Usage](references/usage.md)
- [Image Generation Convention](references/image-generation-convention.md) - **Image Generation Backend Convention**
- [First-time Setup](references/config/first-time-setup.md)

## See Also

需要对比所有视觉 skill 再做决定？→ [视觉 Skill 选择指南](references/visual-skills-guide.md)

## Error Handling

See [references/error-handling.md](references/error-handling.md) for API key recovery steps and SVG fallback strategy.
