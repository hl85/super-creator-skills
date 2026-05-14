# Error Handling

Common error recovery strategies for skills that depend on external APIs or image generation.

## API Key Missing

If a tool exits with `No API key found` (or any variant of "missing key / missing credentials"), **do not silently fail or abandon the task**. Required steps:

1. Use `AskUserQuestion` to ask the user which provider they have and to supply the key.  
   Example question: *"图片生成需要 API Key，您有哪个服务的 Key？（OpenAI / Google / DashScope / MiniMax 等）"*

2. Save the key to `~/.super-creator/.env` (user-level, persists across projects). Use this exact shell sequence:
   ```bash
   mkdir -p ~/.super-creator
   # Remove any existing line for this key first to avoid duplicates, then append
   grep -v "^OPENAI_API_KEY=" ~/.super-creator/.env 2>/dev/null > /tmp/sc-env-tmp && mv /tmp/sc-env-tmp ~/.super-creator/.env || true
   echo "OPENAI_API_KEY=<value-from-user>" >> ~/.super-creator/.env
   ```
   Replace `OPENAI_API_KEY` with the correct variable name for the provider the user specified (see provider → variable mapping below).

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

## SVG Fallback for Logical Diagrams

When image generation is unavailable (no API key, network error, quota exhausted) **and** the request is a logical or structural diagram — wireframe, flowchart, architecture map, navigation diagram, mind map, framework diagram — do not block delivery. Instead:

1. Generate clean SVG markup directly using your code-writing capability (no external API required).
2. Save the file with an `.svg` extension to the target output path.
3. Inform the user that the image was delivered as a vector diagram instead of a raster image.

This fallback is zero-dependency, produces high-resolution scalable output, and is appropriate whenever pixel-art or photorealistic aesthetics are not required.
