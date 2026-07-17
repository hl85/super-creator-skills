# Imagine: Providers & Models

Detailed list of supported providers and their specific model configurations.

## Supported Providers

**Auto-selected (in priority order):**
1. **Google**: gemini-3-pro-image-preview (Imagen 3)
2. **OpenAI**: gpt-image-1.5
3. **Azure**: Azure OpenAI deployments
4. **OpenRouter**: Multi-model gateway
5. **Replicate**: google/nano-banana-pro (Nano Banana API)
6. **Seedream**: doubao-seedream-5-0 (豆包)
7. **MiniMax**: image-01 (海螺)
8. **Jimeng**: jimeng_t2i_v40 (即梦)

**Explicit selection only (not auto-selected):**
- **DashScope (混元)**: qwen-image-2.0-pro — removed from auto-fallback due to poor quality. Use `--provider dashscope` to explicitly select.

## Model Resolution
Load Priority: CLI args > EXTEND.md > env vars > project .env > user .env

## Image Generation Priority
Remember: **`sc-web-ai` (web-based Gemini/ChatGPT) is the preferred method for most cases.**
Use `sc-imagine` only when:
- You need batch generation (3+ images)
- You need reference image / style consistency
- The user explicitly requests API-based generation
- Web AI is unavailable (browser not logged in)

See `../../../docs/image-generation-priority.md` for full strategy.
