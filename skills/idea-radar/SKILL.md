---
name: idea-radar
description: Periodic content-idea sweep. Reads a per-project sources.yaml (X lists, RSS, GitHub trending, Exa queries, YouTube channels, 公众号 feeds), pulls signal via agent-reach, deduplicates against the existing idea ledger, scores each candidate for writeability and platform fit (wechat / x), and appends to ideas.jsonl. Pairs with loop or schedule skills for recurring runs. Use when user asks to "找选题", "扫一下今天有什么可写的", "idea radar", "scan for ideas", "刷一下趋势", or wants a recurring trending sweep.
version: 0.1.0
metadata:
  openclaw:
    homepage: https://github.com/hl85/supper-creator
---

# Idea Radar

Pulls trending / fresh signal from multiple sources via `agent-reach`, scores each candidate for writeability and per-platform fit, and appends to a persistent ledger.

## Invocation

```
/idea-radar [--sources <path>] [--limit <n>] [--platforms wechat,x] [--since <duration>] [--ledger <path>]
```

| Flag | Default | Meaning |
|------|---------|---------|
| `--sources` | `.supper-creator/idea-radar/sources.yaml` (project) → `~/.supper-creator/idea-radar/sources.yaml` (user) → `templates/sources.example.yaml` (skill) | Source catalog |
| `--limit` | 20 | Max new ideas appended per run |
| `--platforms` | `wechat,x` | Which platforms to score for |
| `--since` | `24h` | Only consider items published in this window |
| `--ledger` | `.supper-creator/idea-radar/ideas.jsonl` | Append-only JSONL store |

## Pipeline

```
sources.yaml ─► sweep (agent-reach) ─► dedupe ─► score ─► append → ideas.jsonl
```

The agent follows:
- [prompts/sweep.md](prompts/sweep.md) — invoke channels per source type
- [prompts/dedupe.md](prompts/dedupe.md) — within-batch + against-ledger
- [prompts/score.md](prompts/score.md) — LLM rubric → numeric scores

## Ledger schema (`ideas.jsonl`)

One JSON object per line. Append-only; never edit prior lines.

```json
{
  "id": "<sha1 of canonical url + title>",
  "found_at": "2026-04-29T03:14:22Z",
  "source": "x:list:dev-influencers",
  "title": "...",
  "url": "https://...",
  "summary": "≤ 200 chars",
  "tags": ["llm", "tooling"],
  "scores": {
    "writeability": 4,
    "novelty": 3,
    "wechat_fit": 5,
    "x_fit": 4,
    "evidence_depth": 3
  },
  "verdict": "high|medium|low",
  "notes": "one line",
  "claimed_by": null,
  "outcome": null
}
```

`claimed_by` and `outcome` are filled by downstream skills (`writeflow` writes its draft path; `post-analytics` writes engagement numbers later) — `idea-radar` only writes them as `null`.

## Default verdict thresholds

| Verdict | Min `writeability + novelty` | Tip |
|---------|------------------------------|-----|
| `high` | ≥ 8 | Surface immediately to user |
| `medium` | 5–7 | Keep in ledger; show on demand |
| `low` | ≤ 4 | Append silently |

## Configuration (`sources.yaml`)

See `templates/sources.example.yaml` for a runnable starter. Channel types map 1:1 to `agent-reach` categories: `search` / `social` / `dev` / `web` / `video`.

## What idea-radar does NOT do

- **Doesn't draft anything** — feed `writeflow outline` with a chosen idea row.
- **Doesn't post** — that's the multi-publish chain.
- **Doesn't translate** — sources are read in their native language; the score rubric handles cross-language relevance.
- **Doesn't deduplicate semantically across very different titles** — only canonical URL + normalized title. Sibling articles on the same topic will both be appended; the user can collapse manually.

## Pairing with `loop` / `schedule`

```
/loop 6h /idea-radar               # in-process recurring
/schedule "0 7 * * *" /idea-radar  # daily 7am via the schedule skill
```

## References

- [prompts/sweep.md](prompts/sweep.md)
- [prompts/dedupe.md](prompts/dedupe.md)
- [prompts/score.md](prompts/score.md)
- [references/sources.md](references/sources.md)
- [templates/sources.example.yaml](templates/sources.example.yaml)
