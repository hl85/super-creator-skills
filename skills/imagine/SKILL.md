---
name: imagine
description: AI image generation with OpenAI, Azure OpenAI, Google, OpenRouter, DashScope, MiniMax, Jimeng, Seedream and Replicate APIs. Supports text-to-image, reference images, aspect ratios, and batch generation from saved prompt files. Sequential by default; use batch parallel generation when the user already has multiple prompts or wants stable multi-image throughput. Use when user asks to generate, create, or draw images.
version: 1.56.4
---

# Image Generation (AI SDK)

Official API-based image generation across multiple providers.

## Usage

All commands use `./sc-run imagine main`.

```bash
# Basic generation
./sc-run imagine main --prompt "A futuristic city" --image city.png

# Aspect ratio and quality
./sc-run imagine main --prompt "Landscape" --image out.png --ar 16:9 --quality 2k

# Batch generation from JSON
./sc-run imagine main --batchfile batch.json --jobs 4

# Reference-based generation
./sc-run imagine main --prompt "Make blue" --image out.png --ref source.png
```

## Intents

- **Single Image Generation**: Create images from text or reference files.
- **Batch Processing**: Efficiently generate multiple images in parallel.
- **Provider Switching**: Toggle between OpenAI, Google, MiniMax, DashScope, etc.

## Progressive Disclosure

For detailed provider models, environment variables, and advanced configuration, see:

- [references/providers-and-models.md](references/providers-and-models.md) - **Full Model List & Provider Details**
- [references/environment-variables.md](references/environment-variables.md) - **API Key & Config Variables**
- [references/config/preferences-schema.md](references/config/preferences-schema.md) - **EXTEND.md Options**
- [references/batch-format.md](references/batch-format.md) - **Batch JSON Schema**

## Error Handling

See [docs/error-handling.md](../../docs/error-handling.md) for API key recovery steps and SVG fallback strategy for logical diagrams.
