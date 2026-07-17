# Image Generation Convention

## Backend

Image generation is delegated to the **available image generation skill (default: `sc-imagine`)**.

- If multiple image generation skills are available, ask the user to choose.
- If no image generation skill is available, prompt the user to configure an API Key or install an image generation skill.

## Prompt Files

**Every generated image must have its complete prompt written to a dedicated `prompts/NN-*.md` file BEFORE generation.**

- Prompt file naming: `prompts/NN-{type}-{slug}.md` (e.g., `01-cover-ai-tools.md`)
- The generation command should use the prompt file rather than passing inline prompt text.
- Do NOT pass ad-hoc inline text to `--prompt` without first saving the prompt file.

## Generation Command

Recommended invocation (via `sc-imagine` skill):

```bash
./sc-run sc-imagine main --promptfile prompts/01-cover-ai-tools.md
```

For image series (第 2+ 张), pass the first image as style reference:

```bash
./sc-run sc-imagine main --promptfile prompts/02-content-why-ai.md --ref 01-cover-ai-tools.png
```

Adjust parameters based on the chosen image generation skill's interface.
