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
