---
name: url-to-markdown
description: Fetch any URL and convert to markdown using sc-fetch CLI (Chrome CDP with site-specific adapters). Built-in adapters for X/Twitter, YouTube transcripts, Hacker News threads, and generic pages via Defuddle. Handles login/CAPTCHA via interaction wait modes. Use when user wants to save a webpage as markdown.
version: 1.60.0
---

# URL to Markdown

Fetches any URL via `sc-fetch` (Chrome CDP) and converts it to clean, reader-friendly Markdown.

## Usage

All commands use `./sc-run url-to-markdown main`.

```bash
# Basic fetch to file
./sc-run url-to-markdown main <url> --output article.md

# Handle login/CAPTCHA (interactive)
./sc-run url-to-markdown main <url> --wait-for interaction --output article.md

# Download media locally
./sc-run url-to-markdown main <url> --output article.md --download-media

# Force specific adapter (e.g., youtube)
./sc-run url-to-markdown main <url> --adapter youtube --output transcript.md
```

## Intents

- **Web Ingestion**: Convert blogs, news, and docs into Markdown.
- **Structured Extraction**: Extract X threads, YouTube transcripts, and HN comments.
- **Gate Bypassing**: Handle Cloudflare, logins, and CAPTCHAs via interaction modes.
- **Local Archiving**: Download images and videos for offline use.

## Progressive Disclosure

For detailed capture modes, quality assessment rules, and site-specific adapters, see:

- [references/adapters-and-modes.md](references/adapters-and-modes.md) - **Capture Modes & Site Adapters**
- [references/quality-gate.md](references/quality-gate.md) - **Agent Quality Checks & Recovery**
- [references/media-workflow.md](references/media-workflow.md) - **Handling Images & Videos**
- [references/preferences.md](references/preferences.md) - **EXTEND.md & First-time Setup**
- [references/technical-details.md](references/technical-details.md) - **CDP, Profiles, & Env Vars**
