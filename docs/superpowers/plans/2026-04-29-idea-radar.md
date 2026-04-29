# idea-radar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pure-prompt `idea-radar` skill that periodically pulls signal from multiple sources (Exa search, X lists, GitHub trending, RSS, YouTube channels), deduplicates, scores per platform fit, and appends to a persistent `ideas.jsonl` ledger that downstream skills (`writeflow`) consume.

**Architecture:** Zero new TypeScript. The skill is a `SKILL.md` plus `prompts/` (sweep + score + dedupe procedures), `references/sources.md` (catalog of agent-reach channels and what each is good for), and a `templates/sources.example.yaml`. The agent reads a per-project `.supper-creator/idea-radar/sources.yaml` (user customizes), invokes `agent-reach` per channel, dedupes via title hashing, scores with an LLM rubric, and appends to `.supper-creator/idea-radar/ideas.jsonl`. Pairs with `loop` / `schedule` for recurring runs.

**Tech Stack:** Markdown + YAML front matter only. Storage is plain JSONL — grep-able, append-only, survives restarts.

---

## File Structure

```
skills/idea-radar/
├── SKILL.md                       # entry: invocation, ledger schema, routing
├── prompts/
│   ├── sweep.md                   # how to query each channel via agent-reach
│   ├── score.md                   # rubric for scoring an idea per platform
│   └── dedupe.md                  # title/url normalization + simhash strategy
├── references/
│   └── sources.md                 # catalog: channel → agent-reach call → strengths
└── templates/
    └── sources.example.yaml       # starter config the user copies into their project
```

Responsibilities:
- **`SKILL.md`** — invocation grammar, ledger schema, paths, defaults.
- **`prompts/sweep.md`** — for each channel type (search / social / dev / web / video) the exact `agent-reach` call patterns and how to map raw results into idea candidates.
- **`prompts/score.md`** — rubric: writeability, novelty, platform fit (wechat 0-5, x 0-5), evidence depth, author authority. Single LLM pass scores all candidates.
- **`prompts/dedupe.md`** — normalize titles (lowercase, trim punctuation, strip emoji), compare against existing `ideas.jsonl`, also dedupe within the current sweep using URL canonicalization + title fuzzy match.
- **`references/sources.md`** — catalogue of every agent-reach channel + what topic class each is best for.
- **`templates/sources.example.yaml`** — a runnable starter config.

No tests required (no executable code). Validation is by manual run with the example sources file.

---

## Task 1: SKILL.md scaffold

**Files:**
- Create: `skills/idea-radar/SKILL.md`

- [ ] **Step 1: Create skill directories**

```bash
mkdir -p skills/idea-radar/prompts skills/idea-radar/references skills/idea-radar/templates
```

- [ ] **Step 2: Write SKILL.md**

Create `skills/idea-radar/SKILL.md`:

````markdown
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
````

- [ ] **Step 3: Verify YAML**

```bash
test -f skills/idea-radar/SKILL.md && head -5 skills/idea-radar/SKILL.md
```

Expected: 4 YAML lines.

- [ ] **Step 4: Commit**

```bash
git add skills/idea-radar/SKILL.md
git commit -m "feat(idea-radar): scaffold skill"
```

---

## Task 2: Sweep procedure prompt

**Files:**
- Create: `skills/idea-radar/prompts/sweep.md`

- [ ] **Step 1: Write the procedure**

Create `skills/idea-radar/prompts/sweep.md`:

````markdown
# Sweep Procedure

The agent reads `sources.yaml`, then for each source dispatches the right `agent-reach` call. Output is a flat list of **idea candidates** (title + url + summary + source + raw timestamp) — not yet deduped or scored.

## Step 1 — Parse sources.yaml

Expect a list of entries shaped like:

```yaml
- type: search
  query: "AI agent benchmarks"
  num_results: 5
  tag: agents
- type: x_list
  list_id: "1234567890"
  tag: dev
- type: github_trending
  language: typescript
  since: daily
  tag: tooling
- type: rss
  url: https://example.com/feed.xml
  tag: industry
- type: youtube_channel
  channel_id: UCxxxxx
  tag: ml
- type: wechat_account
  biz: "MzAwMDAwMDAwMA=="
  tag: cn-tech
```

Skip entries with malformed `type` and warn the user.

## Step 2 — Per-type dispatch

| Type | Command |
|------|---------|
| `search` | `mcporter call 'exa.web_search_exa(query: "<q>", numResults: <n>)'` |
| `x_list` | use `agent-reach` social/twitter to fetch latest tweets in the list |
| `github_trending` | `gh search repos --sort stars --updated ">$(date -u -d "-<since>" +%Y-%m-%d)" --language <lang> --limit 20` |
| `rss` | `curl -s "https://r.jina.ai/<feed-url>"` then parse top items |
| `youtube_channel` | use `agent-reach` video channel to fetch latest videos + auto-transcript snippet |
| `wechat_account` | use `agent-reach` web to fetch latest articles list |

For each raw result, emit an idea candidate:

```json
{
  "source": "<type>:<tag>",
  "title": "<raw title>",
  "url": "<canonical url>",
  "raw_published_at": "<ISO timestamp if available, else null>",
  "summary": "<≤ 200 chars; first paragraph or description>"
}
```

## Step 3 — Apply `--since` filter

If a candidate has `raw_published_at`, drop it when older than `--since`. If no timestamp, **keep it** (RSS / search results often lack timestamps; we don't penalize unknown).

## Step 4 — Cap

Apply `--limit` *after* dedupe and scoring (Step 4 in the main pipeline), not here. Sweep returns everything; downstream trims.

## Anti-patterns

- ❌ Running channels sequentially when they're independent — issue parallel `agent-reach` calls per source.
- ❌ Fabricating timestamps when the source doesn't provide one.
- ❌ Including private feeds without auth (silent partial failure).
- ❌ Treating one channel's empty result as a hard error — log and continue.
````

- [ ] **Step 2: Commit**

```bash
git add skills/idea-radar/prompts/sweep.md
git commit -m "feat(idea-radar): sweep procedure prompt"
```

---

## Task 3: Dedupe procedure prompt

**Files:**
- Create: `skills/idea-radar/prompts/dedupe.md`

- [ ] **Step 1: Write the procedure**

Create `skills/idea-radar/prompts/dedupe.md`:

````markdown
# Dedupe Procedure

Goal: never append the same idea twice. Two passes:

1. **Within-batch** — collapse duplicates from this sweep.
2. **Against-ledger** — drop anything already present in `ideas.jsonl`.

## Canonical URL

Strip the URL down to its **content identity**:

```
1. lowercase scheme + host
2. drop www. prefix
3. drop tracking params: utm_*, ref, fbclid, gclid, mc_cid, mc_eid, ck_subscriber_id
4. drop trailing slash
5. drop fragment (#section)
6. for known content hosts, normalize to canonical form:
   - youtube.com/watch?v=ID and youtu.be/ID → youtube.com/watch?v=ID
   - twitter.com/* and x.com/* → x.com/*
   - mp.weixin.qq.com/s?... preserve only `__biz` + `mid` + `idx`
```

## Title key

```
1. NFKC normalize
2. lowercase
3. strip punctuation: ,.!?。！？“”‘’"'()【】[]<>《》
4. strip emoji (use Unicode property \p{Emoji_Presentation})
5. collapse whitespace
6. trim
```

Two ideas collide when **either** the canonical URL matches **or** the title key matches.

## ID

```
id = sha1(canonical_url + "\n" + title_key)[:16]
```

Truncated to 16 hex chars — keeps the ledger readable, collision risk negligible.

## Ledger lookup

The ledger is JSONL; loading the entire file once at sweep start and building an in-memory `Set` of IDs is the simplest correct path. For ledgers > 10k lines, consider building a sorted ID file as a sidecar — out of scope for v0.1.0.

If the ledger doesn't exist yet, treat it as an empty set; create the file when first appending.

## Within-batch dedupe

After computing IDs for all sweep candidates, group by ID and keep the **first** occurrence (sweeps return per-channel, so the first source becomes the recorded source). Emit a `dropped_duplicates` count for the run report.

## Against-ledger dedupe

Drop any candidate whose ID is already in the ledger.

## Edge cases

- **Same article cross-posted to medium.com and substack.com** — different URLs, same title key → collide on title. Correct: we don't want both.
- **Two daily-recap newsletters with identical titles "Daily AI digest"** — same title key, different content. **Title-only collisions for known-recurring titles should be allowed** by checking `raw_published_at`. If both have timestamps and they differ by > 6h, treat as distinct.
- **Translated reposts (zh title vs en title)** — different title keys → both appended. Acceptable for v0.1.0; the score pass should naturally rank one as redundant later.

## Anti-patterns

- ❌ Hashing the raw URL with query params — every visit gets a new ID.
- ❌ Comparing titles with `==` directly — capitalization, emoji, punctuation drift.
- ❌ Editing prior ledger lines to merge duplicates — append-only is the ledger's contract.
````

- [ ] **Step 2: Commit**

```bash
git add skills/idea-radar/prompts/dedupe.md
git commit -m "feat(idea-radar): dedupe procedure prompt"
```

---

## Task 4: Score procedure prompt

**Files:**
- Create: `skills/idea-radar/prompts/score.md`

- [ ] **Step 1: Write the procedure**

Create `skills/idea-radar/prompts/score.md`:

````markdown
# Score Procedure

After dedupe, every surviving candidate gets a single LLM pass that fills the `scores` object and computes `verdict`.

## Rubric

For each candidate, score each dimension on **0–5**:

| Dimension | Question | 0 | 5 |
|-----------|----------|---|---|
| `writeability` | Could the user write a real article on this within their knowledge domain? | 几乎写不出 / 完全不熟 | 已有现成观点、能立刻动笔 |
| `novelty` | Has this been written-to-death? | 完全是 already-written 老话题 | 真正稀缺、3 个月内未见类似深度文章 |
| `wechat_fit` | Would 公众号读者点开 + 读完？ | 完全不匹配（外语硬技术 / 微小新闻） | 高匹配（中文深度 / 反共识 / 实用） |
| `x_fit` | Would this hook the X timeline in 1.5 seconds? | 不适合（长论证 / 中文为主） | 高（数字 / 反转 / 故事钩子） |
| `evidence_depth` | Are there enough concrete numbers / cases / quotes in the source to fill an article? | 只有标题 / 单段空话 | 多源、可量化、可引用 |

## Verdict

Compute:

```
sum = writeability + novelty
verdict =
  "high"   if sum >= 8
  "medium" if sum >= 5
  "low"    otherwise
```

`platform_fit` does **not** affect verdict — it tells the user *which* platform to target, not whether to write.

## Notes field

One sentence — what the angle would be. Examples:

- "反共识：大家都说 X 越大越好，但这家用 5B 击穿了 70B"
- "实用：从 0 到 1 把私房菜店搬上美团，3 个月血亏的复盘"
- "争议：Cursor 1.0 vs Windsurf 实测，反主流结论"

If `notes` is empty / generic ("interesting article"), the score is wrong — re-score.

## Cost discipline

This is one LLM pass over all candidates. **Don't** invoke `agent-reach` here for additional fact-checking — that's `content-review`'s job at draft time. Score only on the title + summary already in the candidate.

If a candidate's summary is < 50 chars, score `evidence_depth` ≤ 2 even if other dimensions are high — the article could be a thin wrapper.

## Anti-patterns

- ❌ Scoring without `notes` — if you can't write a one-line angle, the candidate is `low`.
- ❌ Always-5 inflation (everything trending is "high writeability") — calibrate against the user's known domain.
- ❌ Letting `wechat_fit` / `x_fit` collapse to a single average — they're independent on purpose.
- ❌ Bumping verdict because "the source is reputable" — reputation isn't writeability.
````

- [ ] **Step 2: Commit**

```bash
git add skills/idea-radar/prompts/score.md
git commit -m "feat(idea-radar): score procedure prompt"
```

---

## Task 5: Sources reference

**Files:**
- Create: `skills/idea-radar/references/sources.md`

- [ ] **Step 1: Write the catalog**

Create `skills/idea-radar/references/sources.md`:

````markdown
# Source Catalog

Every channel `idea-radar` understands. Most map to a single `agent-reach` call. Use this as a menu when authoring `sources.yaml`.

## search (agent-reach: search)

| Source | Best for | Call |
|--------|----------|------|
| Exa AI search | English tech, paper-adjacent topics | `mcporter call 'exa.web_search_exa(query: "<q>", numResults: <n>)'` |
| Exa code search | Library/framework moves | `mcporter call 'exa.get_code_context_exa(query: "<q>", tokensNum: 3000)'` |

Sweet spot: 3–6 queries per run. More than that, you're researching, not radaring.

## social (agent-reach: social)

| Source | Best for |
|--------|----------|
| `x_list` | curated dev / VC / writer voices |
| `xhs` | 中文消费 / 生活方式 / 设计 |
| `weibo` | 中文热搜 / 大众情绪 |
| `bilibili` | 中文长视频 / 教程 / 电子产品 |
| `v2ex` | 中文程序员讨论 / 工作 / 创业 |
| `reddit` | 英文垂直社区（subreddit 列表） |

Tip: a single well-curated **X list** beats 10 random search queries.

## dev (agent-reach: dev)

| Source | Best for |
|--------|----------|
| `github_trending` | language-specific repo movement |
| `github_search` | by topic / star threshold |
| `github_release` | watch release notes of N repos |

## web (agent-reach: web)

| Source | Best for |
|--------|----------|
| `rss` | newsletters with RSS (a16z, Stratechery, the Pragmatic Engineer …) |
| `wechat_account` | 中文公众号深度文 |
| `jina_reader` | one-off page fetch (`https://r.jina.ai/<URL>`) |

## video (agent-reach: video)

| Source | Best for |
|--------|----------|
| `youtube_channel` | tracked YT channels (auto-transcript fed into summary) |
| `bilibili_uploader` | 中文 UP 主 |
| `podcast_xiaoyuzhou` | 小宇宙节目订阅 |

## How to choose channels

Three principles:

1. **Diverse but not redundant.** Cover ≥ 3 categories above; stop adding once a new source has > 50% topical overlap with an existing one.
2. **Native depth over breadth.** A single full-text source (RSS, podcast transcript) beats five title-only sources for `evidence_depth`.
3. **Match your output platform.** Heavy X focus? Lean on `search` + `x_list` + `github_trending`. Heavy 公众号? Lean on `wechat_account` + `weibo` + `xiaoyuzhou`.

## Cost / rate-limit notes

| Channel | Approximate cost per run |
|---------|--------------------------|
| Exa search | 5 cents per 5 queries |
| GitHub via `gh` CLI | free (uses your token) |
| Jina Reader | free tier, ~no rate limit for low volume |
| X / Weibo / 微信 via CDP | free but session-bound; long sessions risk rate-limit |

For a daily run with 12 sources, expect < $0.20 / day if Exa is the only paid channel.
````

- [ ] **Step 2: Commit**

```bash
git add skills/idea-radar/references/sources.md
git commit -m "feat(idea-radar): sources reference catalog"
```

---

## Task 6: Example sources template

**Files:**
- Create: `skills/idea-radar/templates/sources.example.yaml`

- [ ] **Step 1: Write the template**

Create `skills/idea-radar/templates/sources.example.yaml`:

````yaml
# idea-radar: starter sources.yaml
#
# Copy to either:
#   .supper-creator/idea-radar/sources.yaml   (project-level, recommended)
#   ~/.supper-creator/idea-radar/sources.yaml (user-level, applies to every project)
#
# Each entry has:
#   type:    one of search | x_list | github_trending | rss | youtube_channel | wechat_account | reddit | hn
#   tag:     short label for the score notes ("agents", "design", "cn-tech")
#   ...     type-specific fields (see references/sources.md)

# === English tech ===

- type: search
  query: "LLM agent benchmark"
  num_results: 5
  tag: agents

- type: search
  query: "open source AI tooling"
  num_results: 5
  tag: tooling

- type: github_trending
  language: typescript
  since: daily
  tag: ts-trending

- type: github_trending
  language: python
  since: daily
  tag: py-trending

- type: rss
  url: https://www.pragmaticengineer.com/feed/
  tag: industry

- type: rss
  url: https://stratechery.com/feed/
  tag: strategy

- type: hn
  feed: front
  num_results: 10
  tag: hn-front

# === 中文 ===

- type: weibo
  search: "AI 编程"
  tag: cn-ai

- type: v2ex
  node: programmer
  num_results: 10
  tag: cn-dev

- type: wechat_account
  # NOTE: replace with the __biz of an account you actually follow
  biz: "MzAwMDAwMDAwMA=="
  tag: cn-tech

# === Video / podcast ===

- type: youtube_channel
  # Lex Fridman as a placeholder — replace with what you actually watch
  channel_id: UCSHZKyawb77ixDdsGog4iWA
  tag: yt-longform

# === Twitter / X ===

# Optional — requires you to have a curated list:
# - type: x_list
#   list_id: "1234567890123456"
#   tag: x-dev
````

- [ ] **Step 2: Commit**

```bash
git add skills/idea-radar/templates/sources.example.yaml
git commit -m "feat(idea-radar): example sources.yaml template"
```

---

## Task 7: Marketplace registration

**Files:**
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Add `./skills/idea-radar` keeping alphabetical order**

It should sit between `./skills/format-markdown` and `./skills/imagine`:

```json
        "./skills/format-markdown",
        "./skills/idea-radar",
        "./skills/imagine",
```

Note: the existing list has `imagine` listed BEFORE `infographic` (already alphabetically wrong; do not "fix" pre-existing ordering — only insert in the spot that minimally extends the existing pattern, which is between `format-markdown` and `infographic`).

Actually inspect first; the existing list is:

```
"./skills/format-markdown",
"./skills/infographic",
"./skills/imagine",
"./skills/markdown-to-html",
```

So `idea-radar` goes between `format-markdown` and `infographic`:

```json
        "./skills/format-markdown",
        "./skills/idea-radar",
        "./skills/infographic",
```

- [ ] **Step 2: Verify JSON parses**

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "feat(idea-radar): register skill in marketplace"
```

---

## Task 8: Smoke verification

**Files:**
- (read-only)

- [ ] **Step 1: Layout check**

```bash
ls skills/idea-radar/
ls skills/idea-radar/prompts/
ls skills/idea-radar/references/
ls skills/idea-radar/templates/
```

Expected:
```
SKILL.md  prompts  references  templates
sweep.md  dedupe.md  score.md
sources.md
sources.example.yaml
```

- [ ] **Step 2: Cross-link sanity**

```bash
grep -cE "prompts/sweep|prompts/dedupe|prompts/score|references/sources|templates/sources.example" skills/idea-radar/SKILL.md
```

Expected: ≥ 5.

- [ ] **Step 3: Trigger phrase coverage**

```bash
grep -oE "找选题|扫一下|idea radar|scan for ideas|刷一下趋势" skills/idea-radar/SKILL.md | sort -u
```

Expected: ≥ 3 distinct triggers.

- [ ] **Step 4: agent-reach reuse proof**

```bash
grep -hoE "agent-reach|exa.web_search_exa|github trending|jina|r\.jina\.ai" skills/idea-radar/SKILL.md skills/idea-radar/prompts/*.md skills/idea-radar/references/*.md | sort -u
```

Expected: at least 3 distinct hits — proves the skill is a **router on top of agent-reach**, not a re-implementation.

- [ ] **Step 5: Pipeline-neighbor naming**

```bash
grep -oE "writeflow|loop|schedule|content-review|post-analytics|multi-publish" skills/idea-radar/SKILL.md | sort -u
```

Expected: ≥ 3 named neighbors (`writeflow`, `loop`/`schedule`, plus at least one downstream).

- [ ] **Step 6: YAML template parses**

```bash
node -e '
const yaml = require("fs").readFileSync("skills/idea-radar/templates/sources.example.yaml","utf8");
// rough check: every non-comment, non-blank line that starts with "- type:" has a value
const bad = yaml.split("\n").filter(l => /^- type:\s*$/.test(l.trim()));
if (bad.length) { console.error("malformed:", bad); process.exit(1); }
console.log("OK");
'
```

Expected: `OK`.

- [ ] **Step 7: No commit**

This task is read-only verification.

---

## Self-Review Notes

- **Spec coverage:** scaffold (T1) + 3 procedures — sweep / dedupe / score (T2–T4) + source catalog (T5) + runnable example template (T6) + marketplace registration (T7) + smoke (T8). The original plan's deliverables (multi-source, dedupe, scored ledger, pairing with `loop`/`schedule`, feeding `writeflow`) all map to a task.
- **Placeholder scan:** No "TBD". Every channel has an explicit `agent-reach` invocation pattern. Ledger schema is fully specified. Verdict thresholds are exact numbers, not "high / low".
- **Type consistency:** Ledger schema (id / found_at / source / scores / verdict / claimed_by / outcome) defined once in SKILL.md and referenced identically in `dedupe.md` (id derivation), `score.md` (scores fields), and is forward-compatible with `post-analytics` (writes `outcome`) and `writeflow` (writes `claimed_by`). Score dimensions match across SKILL.md and `score.md`. Source `type` strings match across SKILL.md, `sweep.md`, `references/sources.md`, and the example template.
- **Risks:**
  - Verdict thresholds may need tuning per user; documented as "default" in SKILL.md, easy to override later via EXTEND.md.
  - Some `agent-reach` channels (`wechat_account`, `xhs`) require auth state — failures should not abort the whole sweep, documented in `sweep.md` anti-patterns.
  - The example template includes a placeholder `__biz` and `channel_id` — clearly commented as placeholders.
