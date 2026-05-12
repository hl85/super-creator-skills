---
name: article-illustrator
description: Analyzes article structure, identifies positions requiring visual aids, generates illustrations with Type × Style two-dimension approach. Use when user asks to "illustrate article", "add images", "generate images for article", or "为文章配图".
version: 1.57.0
---

# Article Illustrator

Analyze articles, identify illustration positions, and generate images with Type × Style consistency.

## Usage

```bash
# Analyze article and generate outline
./sc-run article-illustrator build-batch --input path/to/article.md

# Generate images from saved prompts in batch mode
./sc-run imagine build-batch --batchfile output-dir/prompts/batch.json
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
- [First-time Setup](references/config/first-time-setup.md)
