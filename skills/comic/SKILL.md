---
name: comic
description: Knowledge comic creator supporting multiple art styles and tones. Creates original educational comics with detailed panel layouts and sequential image generation. Use when user asks to create "知识漫画", "教育漫画", "biography comic", "tutorial comic", or "Logicomix-style comic".
version: 1.56.1
---

# Knowledge Comic Creator

Create original knowledge comics with flexible art style × tone combinations.

## Usage

```bash
# Generate comic from source file
./sc-run comic main posts/turing-story/source.md

# Generate with specific art and tone
./sc-run comic main article.md --art manga --tone warm

# Merge existing pages to PDF
./sc-run comic merge-to-pdf path/to/comic-dir
```

## Quick Reference

- **Art Styles**: ligne-claire, manga, realistic, ink-brush, chalk
- **Tones**: neutral, warm, dramatic, romantic, energetic, vintage, action
- **Layouts**: standard, cinematic, dense, splash, mixed, webtoon
- **Presets**: `--style ohmsha`, `--style wuxia`, `--style shoujo`

## Documentation

- [Full Workflow & Procedures](references/workflow.md)
- [Art Styles Gallery](references/art-styles/)
- [Tones & Moods](references/tones/)
- [Layout Options](references/layouts/)
- [Partial Workflows](references/partial-workflows.md)
- [First-time Setup](references/config/first-time-setup.md)
