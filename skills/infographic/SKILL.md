---
name: infographic
description: Generates professional infographics with 21 layout types and 20 visual styles. Analyzes content, recommends layout×style combinations, and generates publication-ready infographics. Use when user asks to create "infographic", "信息图", "visual summary", "可视化", or "高密度信息大图".
version: 1.56.1
---

# Infographic Generator

Professional infographic generation with 21 Layouts × 20 Styles.

## Usage

All commands use `./sc-run infographic <script>`. Note: Driven via prompt orchestration.

```bash
# Generate with auto-recommendation
./sc-run infographic main article.md

# Specify layout and style
./sc-run infographic main article.md --layout bento-grid --style tech-schematic

# Specify aspect ratio
./sc-run infographic main article.md --aspect portrait
```

## Intents

- **Visual Summarization**: Convert complex data/text into structured visuals.
- **Dimensional Customization**: Mix and match layouts (Bento, Funnel, Matrix) and styles (Kawaii, Cyberpunk, Lego).
- **Faithful Transformation**: Map source content exactly to visual elements.

## Progressive Disclosure

For detailed layout definitions, style galleries, and structured content templates, see:

- [references/galleries.md](references/galleries.md) - **Layout & Style Galleries**
- [references/workflow.md](references/workflow.md) - **7-Step Workflow & Analysis**
- [references/structured-content-template.md](references/structured-content-template.md) - **Intermediary Format**
- [references/config/preferences-schema.md](references/config/preferences-schema.md) - **EXTEND.md Options**

## See Also

需要对比所有视觉 skill 再做决定？→ [docs/visuals.md](../../docs/visuals.md)
