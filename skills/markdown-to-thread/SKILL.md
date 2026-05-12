---
name: markdown-to-thread
description: Slices a Markdown article into an X (Twitter) thread JSON. Greedy-packs paragraphs into tweet-sized segments (default 270 chars, CJK-aware), can prepend a hook tweet from the title/lede and append a CTA tweet, and emits thread.json ready for post-to-x. Use when user asks to "split article into thread", "拆成 thread", "拆成推文串", "markdown to thread", or wants to publish a long article on X as a thread. [Beta]
version: 0.1.0
---

# Markdown to Thread

Slices Markdown articles into X thread JSON payloads optimized for engagement.

## Usage

> ⚠️ **Beta** — 此 skill 通过 Claude 对话调用（prompt 驱动），以下 CLI 命令仅作参考，尚未实现。

This skill is driven via prompt orchestration. Invoke it by describing what you need in the conversation.

```bash
# [示例，暂不可用] Basic slice
# [示例，暂不可用] ./sc-run markdown-to-thread main article.md

# [示例，暂不可用] Slice with specific max length and number numbering
# [示例，暂不可用] ./sc-run markdown-to-thread main article.md --max-len 270 --number on

# [示例，暂不可用] Add a custom CTA tweet
# [示例，暂不可用] ./sc-run markdown-to-thread main article.md --cta "Follow for more!"
```

## Intents

- **Thread Slicing**: Automatically break long Markdown into tweet-sized chunks.
- **Hook & CTA Generation**: Prepend openers and append calls-to-action.
- **Payload Preparation**: Generate JSON compatible with `post-to-x`.

## Progressive Disclosure

For detailed slicing logic, character counting rules, and thread craft tips, see:

- [references/thread-style.md](references/thread-style.md) - **Thread Craft & Engagement**
- [references/technical-details.md](references/technical-details.md) - **JSON Output & Max Length Logic**

## Next Step — 发布到 X

`markdown-to-thread` 输出 `thread.json` 后，用 `post-to-x` 发布：

```bash
./sc-run post-to-x x-browser --thread thread.json
```

> Beta skill 产出的 `thread.json` 路径由对话时指定的输出目录决定，默认为 `./thread.json`。
