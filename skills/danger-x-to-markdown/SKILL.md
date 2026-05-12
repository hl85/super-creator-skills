---
name: danger-x-to-markdown
description: Converts X (Twitter) tweets and articles to markdown with YAML front matter. Uses reverse-engineered API requiring user consent. Use when user mentions "X to markdown", "tweet to markdown", "save tweet", or provides x.com/twitter.com URLs for conversion.
version: 1.56.1
---

# X to Markdown

Converts X tweets, threads, and articles to Markdown with YAML front matter.

## Usage

All commands use `./sc-run danger-x-to-markdown main`.

```bash
# Convert a tweet or thread
./sc-run danger-x-to-markdown main https://x.com/user/status/123

# Convert with local media download
./sc-run danger-x-to-markdown main https://x.com/user/status/123 --download-media

# Convert and save to specific path
./sc-run danger-x-to-markdown main <url> -o article.md
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
