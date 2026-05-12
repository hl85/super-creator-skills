---
name: idea-radar
description: Periodic content-idea sweep. Reads a per-project sources.yaml (X lists, RSS, GitHub trending, Exa queries, YouTube channels, 公众号 feeds), pulls signal via agent-reach, deduplicates against the existing idea ledger, scores each candidate for writeability and platform fit (wechat / x), and appends to ideas.jsonl. Pairs with loop or schedule skills for recurring runs. Use when user asks to "找选题", "扫一下今天有什么可写的", "idea radar", "scan for ideas", "刷一下趋势", or wants a recurring trending sweep. [Beta]
version: 0.1.0
---

# Idea Radar

Trending content discovery and writeability scoring.

## Usage

> ⚠️ **Beta** — 此 skill 通过 Claude 对话调用（prompt 驱动），以下 CLI 命令仅作参考，尚未实现。

This skill is driven via prompt orchestration. Invoke it by describing what you need in the conversation.

```bash
# [示例，暂不可用] Run a content sweep
# [示例，暂不可用] ./sc-run idea-radar sweep --sources sources.yaml --limit 20

# [示例，暂不可用] View current ledger
# [示例，暂不可用] cat .super-creator/idea-radar/ideas.jsonl
```

## Intents

- **Content Sweeping**: Pull fresh signals from X, RSS, GitHub, etc.
- **Deduplication & Scoring**: Filter and rank ideas by novelty and platform fit.
- **Ledger Management**: Maintain a persistent store of content ideas.

## Progressive Disclosure

For detailed pipeline logic, scoring rubrics, and ledger schemas, see:

- [references/ledger-schema.md](references/ledger-schema.md) - **JSONL Format & Fields**
- [references/sources.md](references/sources.md) - **Configuring sources.yaml**
- [prompts/score.md](prompts/score.md) - **LLM Scoring Rubric**
- [prompts/sweep.md](prompts/sweep.md) - **Sweep Implementation Logic**
