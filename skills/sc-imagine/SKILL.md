---
name: sc-imagine
description: AI image generation with OpenAI, Azure OpenAI, Google, OpenRouter, MiniMax, Jimeng, Seedream and Replicate APIs. Supports text-to-image, reference images, aspect ratios, and batch generation from saved prompt files. Sequential by default; use batch parallel generation when the user already has multiple prompts or wants stable multi-image throughput. **NOTE: This is the SECONDARY image generation method. For most cases, prefer sc-web-ai (free web-based Gemini/ChatGPT) first. Use sc-imagine when you need batch generation, API stability, or have API keys configured.** Use when user asks to generate, create, or draw images AND explicitly requests API-based generation, needs batch mode, or web AI is unavailable.
version: 1.57.0
---

# Image Generation (AI SDK)

Official API-based image generation across multiple providers. **This is the secondary option — prefer `sc-web-ai` first for free web-based generation.**

## Priority (v3.4.0+)

| Priority | Method | Skill | Use when |
|----------|--------|-------|----------|
| 1 (首选) | Web AI | `sc-web-ai` | Default for most cases. Free, no API key needed |
| 2 (次选) | Official APIs | `sc-imagine` | Batch generation, reference images, user has API keys |

**DashScope (混元) note**: Removed from auto-fallback due to poor quality. Users can still explicitly select via `--provider dashscope`.

## Provider Auto-Selection Priority (when no --provider specified)

1. Google (Imagen 3)
2. OpenAI (GPT Image 1.5)
3. Azure OpenAI
4. OpenRouter
5. Replicate (Nano Banana API)
6. Seedream (豆包)
7. MiniMax (海螺)
8. Jimeng (即梦)

## Usage

All commands use `./sc-run sc-imagine main`.

```bash
# Basic generation
./sc-run sc-imagine main --prompt "A futuristic city" --image city.png

# Aspect ratio and quality
./sc-run sc-imagine main --prompt "Landscape" --image out.png --ar 16:9 --quality 2k

# Batch generation from JSON
./sc-run sc-imagine main --batchfile batch.json --jobs 4

# Reference-based generation
./sc-run sc-imagine main --prompt "Make blue" --image out.png --ref source.png
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
- [sc-styles 统一风格库](../sc-styles/references/catalog.md) - **49+ 种预设视觉风格，可直接用于 --prompt**

## See Also

- 视觉风格库 → [sc-styles](../sc-styles/SKILL.md)
- 免费网页生图（首选）→ [sc-web-ai](../sc-web-ai/SKILL.md)

## Error Handling

See [references/error-handling.md](references/error-handling.md) for API key recovery steps and SVG fallback strategy for logical diagrams.
