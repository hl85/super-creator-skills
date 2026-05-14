---
name: cover-image
description: Generates article cover images with 5 dimensions (type, palette, rendering, text, mood) combining 10 color palettes and 7 rendering styles. Supports cinematic (2.35:1), widescreen (16:9), and square (1:1) aspects. Use when user asks to "generate cover image", "create article cover", or "make cover".
version: 1.56.1
---

# Cover Image Generator

Generates elegant cover images with 5-dimensional customization (Type, Palette, Rendering, Text, Mood, Font).

## Usage

All commands use `./sc-run cover-image <script>`. Note: The main logic is currently driven via prompt orchestration.

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
- [references/palettes/](references/palettes/) - **Color Palette Gallery**
- [references/renderings/](references/renderings/) - **Rendering Styles Gallery**
- [references/types.md](references/types.md) - **Image Type Definitions**

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
