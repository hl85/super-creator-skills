# Image Generation Convention

## Backend

Image generation is delegated to the **available image generation skill (default: `sc-imagine`)**.

- If multiple image generation skills are available, ask the user to choose.
- If no image generation skill is available, prompt the user to configure an API Key or install an image generation skill.

## Prompt Files

**Every generated image must have its complete prompt written to a dedicated `prompts/NN-*.md` file BEFORE generation.**

- Prompt file naming: `prompts/NN-{type}-{slug}.md` (e.g., `01-illustration-intro.md`)
- The generation command should use the prompt file rather than passing inline prompt text.
- Do NOT pass ad-hoc inline text to `--prompt` without first saving the prompt file.

## Batch Generation

Article illustrations support batch mode for efficiency:

1. Build batch file: `./sc-run sc-article-illustrator build-batch --input article.md`
2. Generate all images: `./sc-run sc-imagine main --batchfile prompts/batch.json`

## Generation Command

Recommended invocation (via `sc-imagine` skill):

```bash
./sc-run sc-imagine main --promptfile prompts/01-illustration-intro.md
```

Adjust parameters based on the chosen image generation skill's interface.
