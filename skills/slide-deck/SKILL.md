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

## See Also

需要对比所有视觉 skill 再做决定？→ [docs/visuals.md](../../docs/visuals.md)

## Error Handling

See [docs/error-handling.md](../../docs/error-handling.md) for full details.

**If image generation fails with `No API key found` / `[ACTION_REQUIRED: ask_user_for_api_key]`:**

1. **Do not abandon the task.** Use `AskUserQuestion` to ask the user which provider they have and request the key.
2. Save the key — use this exact sequence (replace variable name per provider):
   ```bash
   mkdir -p ~/.super-creator
   grep -v "^OPENAI_API_KEY=" ~/.super-creator/.env 2>/dev/null > /tmp/sc-env-tmp && mv /tmp/sc-env-tmp ~/.super-creator/.env || true
   echo "OPENAI_API_KEY=<value-from-user>" >> ~/.super-creator/.env
   ```
   Provider → variable: `OpenAI=OPENAI_API_KEY`, `Google/Gemini=GOOGLE_API_KEY`, `DashScope=DASHSCOPE_API_KEY`, `MiniMax=MINIMAX_API_KEY`, `OpenRouter=OPENROUTER_API_KEY`, `Replicate=REPLICATE_API_TOKEN`, `Seedream/Ark=ARK_API_KEY`
3. Retry the original command.
