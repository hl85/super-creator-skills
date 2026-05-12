---
name: slide-deck
description: Generates professional slide deck images from content. Creates outlines with style instructions, then generates individual slide images. Use when user asks to "create slides", "make a presentation", "generate deck", "slide deck", or "PPT".
version: 1.56.1
---

# Slide Deck Generator

Transforms content into professional slide deck images (PPTX/PDF).

## Usage

All commands use `./sc-run slide-deck <script>`.

```bash
# Generate full deck from article
./sc-run slide-deck main article.md

# Specify style and slide count
./sc-run slide-deck main article.md --style sketch-notes --slides 12

# Regenerate specific slides
./sc-run slide-deck main <dir> --regenerate 3,5

# Merge images to PPTX/PDF
./sc-run slide-deck merge-to-pptx <dir>
```

## Intents

- **Deck Generation**: Create a visual narrative from long-form content.
- **Visual Stylization**: Apply presets like Blueprint, Chalkboard, or Minimal.
- **Structural Review**: Multi-round confirmation for style, audience, and outline.
- **Multi-format Output**: Export to PNG, PPTX, and PDF.

## Progressive Disclosure

For detailed style dimensions, design guidelines, and the full 9-step workflow, see:

- [references/workflow.md](references/workflow.md) - **Full 9-Step Process**
- [references/style-and-design.md](references/style-and-design.md) - **Styles, Presets & Design Rules**
- [references/modification-guide.md](references/modification-guide.md) - **Editing & Renumbering**
- [references/config/preferences-schema.md](references/config/preferences-schema.md) - **EXTEND.md Options**
