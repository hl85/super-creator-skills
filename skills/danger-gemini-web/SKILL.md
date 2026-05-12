---
name: danger-gemini-web
description: Generates images and text via reverse-engineered Gemini Web API. Supports text generation, image generation from prompts, reference images for vision input, and multi-turn conversations. Use when other skills need image generation backend, or when user requests "generate image with Gemini", "Gemini text generation", or needs vision-capable AI generation.
version: 1.56.1
---

# Gemini Web Client

Text and image generation via reverse-engineered Gemini Web API.

## Usage

All commands use `./sc-run danger-gemini-web main`.

```bash
# Text generation
./sc-run danger-gemini-web main "Explain quantum computing"

# Image generation
./sc-run danger-gemini-web main --prompt "A futuristic lab" --image sci-fi.png

# Vision input
./sc-run danger-gemini-web main --prompt "Describe this" --ref image.png

# Multi-turn session
./sc-run danger-gemini-web main "Remember 42" --sessionId my-chat
```

## Intents

- **Chat & Generation**: Standard text and image generation.
- **Vision Analysis**: Process reference images for multimodal tasks.
- **Session Management**: Maintain context across multiple turns.
- **Proxy Support**: Connect via HTTP/HTTPS proxies.

## Progressive Disclosure

For required consent flows, model lists, and authentication details, see:

- [references/consent-flow.md](references/consent-flow.md) - **Reverse-API Disclaimer**
- [references/models.md](references/models.md) - **Pro, Flash & Thinking Models**
- [references/preferences.md](references/preferences.md) - **EXTEND.md & Proxy Config**
- [references/technical-details.md](references/technical-details.md) - **Auth, Cookies & Env Vars**
