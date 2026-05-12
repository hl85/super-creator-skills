---
name: x-to-markdown
description: Converts X (Twitter) tweets, threads, and articles to Markdown with YAML front matter and optional media download. Uses reverse-engineered API (requires user consent, see references/consent-flow.md) — prefer url-to-markdown for clean text-only extraction. Use when user mentions "X to markdown", "tweet to markdown", "save tweet", "下载推文", or provides x.com/twitter.com URLs and needs media or full thread fidelity.
version: 1.56.1
---

# X to Markdown

Converts X tweets, threads, and articles to Markdown with YAML front matter.

## Usage

All commands use `./sc-run x-to-markdown main`.

```bash
# Convert a tweet or thread
./sc-run x-to-markdown main https://x.com/user/status/123

# Convert with local media download
./sc-run x-to-markdown main https://x.com/user/status/123 --download-media

# Convert and save to specific path
./sc-run x-to-markdown main <url> -o article.md
```

## Intents

- **Tweet Extraction**: Convert single tweets or threads to Markdown.
- **Article Extraction**: Extract full content from X Articles.
- **Media Localization**: Download images and videos to local directories and update links.

## Progressive Disclosure

For consent requirements, media workflows, and preferences, see:

- [references/consent-flow.md](references/consent-flow.md) - **Required Consent Step**
- [references/media-workflow.md](references/media-workflow.md) - **Handling Images & Videos**
- [references/preferences.md](references/preferences.md) - **EXTEND.md & First-time Setup**
- [references/technical-details.md](references/technical-details.md) - **Auth & URL Support**
