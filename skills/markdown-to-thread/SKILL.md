---
name: markdown-to-thread
description: Slices a Markdown article into an X (Twitter) thread JSON. Greedy-packs paragraphs into tweet-sized segments (default 270 chars, CJK-aware), can prepend a hook tweet from the title/lede and append a CTA tweet, and emits thread.json ready for post-to-x. Use when user asks to "split article into thread", "拆成 thread", "拆成推文串", "markdown to thread", or wants to publish a long article on X as a thread.
version: 0.1.0
---

# Markdown to Thread

Slices Markdown articles into X thread JSON payloads optimized for engagement.

## Usage

All commands use `./sc-run markdown-to-thread main`.

```bash
# Basic slice
./sc-run markdown-to-thread main article.md

# Slice with specific max length and number numbering
./sc-run markdown-to-thread main article.md --max-len 270 --number on

# Add a custom CTA tweet
./sc-run markdown-to-thread main article.md --cta "Follow for more!"
```

## Intents

- **Thread Slicing**: Automatically break long Markdown into tweet-sized chunks.
- **Hook & CTA Generation**: Prepend openers and append calls-to-action.
- **Payload Preparation**: Generate JSON compatible with `post-to-x`.

## Progressive Disclosure

For detailed slicing logic, character counting rules, and thread craft tips, see:

- [references/thread-style.md](references/thread-style.md) - **Thread Craft & Engagement**
- [references/technical-details.md](references/technical-details.md) - **JSON Output & Max Length Logic**
