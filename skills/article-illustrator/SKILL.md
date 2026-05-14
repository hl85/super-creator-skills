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
