---
name: comic
description: Knowledge comic creator supporting multiple art styles and tones. Creates original educational comics with detailed panel layouts and sequential image generation. Use when user asks to create "知识漫画", "教育漫画", "biography comic", "tutorial comic", or "Logicomix-style comic".
version: 1.56.1
---

# Knowledge Comic Creator

Create original knowledge comics with flexible art style × tone combinations.

## Usage

All commands use `./sc-run comic <script>`. Image generation is delegated to the available image generation skill (default: `imagine`). If multiple image generation skills are available, ask the user to choose; if none are available, prompt the user to configure an API Key or install an image generation skill.

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
- [Image Generation Convention](references/image-generation-convention.md) - **Image Generation Backend Convention**
- [First-time Setup](references/config/first-time-setup.md)

## See Also

需要对比所有视觉 skill 再做决定？→ [视觉 Skill 选择指南](references/visual-skills-guide.md)

## Error Handling

See [references/error-handling.md](references/error-handling.md) for API key recovery steps and SVG fallback strategy.
