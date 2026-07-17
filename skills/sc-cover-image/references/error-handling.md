# Error Handling

Common error recovery strategies for cover image generation.

## API Key Missing

If image generation exits with `No API key found` (or any variant of "missing key / missing credentials"), **do not silently fail or abandon the task**. Required steps:

1. Use `AskUserQuestion` to ask the user which provider they have and to supply the key.
   Example question: *"封面图生成需要 API Key，您有哪个服务的 Key？（OpenAI / Google / DashScope / MiniMax 等）"*

2. Save the key to `~/.super-creator/.env` (user-level, persists across projects). Use this exact shell sequence:
   ```bash
   mkdir -p ~/.super-creator
   # Remove any existing line for this key first to avoid duplicates, then append
   grep -v "^OPENAI_API_KEY=" ~/.super-creator/.env 2>/dev/null > /tmp/sc-env-tmp && mv /tmp/sc-env-tmp ~/.super-creator/.env || true
   echo "OPENAI_API_KEY=<value-from-user>" >> ~/.super-creator/.env
   ```
   Replace `OPENAI_API_KEY` with the correct variable name for the provider the user specified.

3. Retry the original command.

### Provider → Environment Variable

| Provider | Variable |
|----------|----------|
| OpenAI | `OPENAI_API_KEY` |
| Google / Gemini | `GOOGLE_API_KEY` or `GEMINI_API_KEY` |
| DashScope (Aliyun) | `DASHSCOPE_API_KEY` |
| MiniMax | `MINIMAX_API_KEY` |
| OpenRouter | `OPENROUTER_API_KEY` |
| Replicate | `REPLICATE_API_TOKEN` |
| Azure OpenAI | `AZURE_OPENAI_API_KEY` + `AZURE_OPENAI_BASE_URL` |
| Seedream / Ark | `ARK_API_KEY` |
| Jimeng | `JIMENG_ACCESS_KEY_ID` + `JIMENG_SECRET_ACCESS_KEY` |

## SVG Fallback for Typographic Covers

When image generation is unavailable (no API key, network error, quota exhausted) **and** the cover type is typographic, minimal, or text-focused (not photorealistic or illustration-heavy), do not block delivery. Instead:

1. Generate a clean SVG cover with typography, geometric shapes, and color blocks (no external API required).
2. Save the file with an `.svg` extension to the target output path.
3. Inform the user that the cover was delivered as a vector graphic instead of a raster image.

This fallback works best for minimal, flat-vector, or duotone cover styles. For styles that require painterly or photorealistic rendering (e.g., painterly, digital art), notify the user that image generation is unavailable.
