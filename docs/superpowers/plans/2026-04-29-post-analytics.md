# post-analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pure-prompt `post-analytics` skill that reads engagement metrics for already-published posts (WeChat 公众号, X, Weibo) and writes them back into the `ideas.jsonl` ledger's `outcome` field, closing the idea-radar → writeflow → multi-publish → analytics flywheel.

**Architecture:** Zero new TypeScript. The skill is a `SKILL.md` plus `prompts/` (per-platform read procedures) and a `references/metrics.md` table. Each platform's analytics page is fetched via the existing CDP browser session (re-uses the same `SC_CHROME_PROFILE_DIR` as `post-to-*`), parsed, and the structured numbers are appended to the right ledger row. No new browser session — the user is already logged in.

**Tech Stack:** Markdown + YAML front matter. Re-uses existing `agent-reach` (web reader + jina) for public-page reads and the shared Chrome profile (via the `post-to-*` skills' CDP infrastructure) for back-office pages.

---

## File Structure

```
skills/post-analytics/
├── SKILL.md                          # entry: invocation, ledger update contract
├── prompts/
│   ├── pull-wechat.md                # 公众号 后台 statistics page → metrics
│   ├── pull-x.md                     # X analytics page or per-tweet API → metrics
│   └── pull-weibo.md                 # weibo.com data center → metrics
└── references/
    └── metrics.md                    # canonical metric names + cross-platform mapping
```

Responsibilities:
- **`SKILL.md`** — invocation grammar, ledger-write contract (which row gets the `outcome`), default time windows, required inputs.
- **`prompts/pull-wechat.md`** — exact CDP / page navigation steps for 公众号后台 → 统计 page; what selectors / network endpoints carry the numbers.
- **`prompts/pull-x.md`** — analytics.x.com per-tweet view + thread-level aggregation rules.
- **`prompts/pull-weibo.md`** — weibo.com data view (and fallback to Jina Reader on the public post page).
- **`references/metrics.md`** — canonical names (`impressions`, `reads`, `engagements`, `shares`, `replies`, `bookmarks`, `followers_gained`) and which platform exposes which.

No tests required. Validation is by manual run with one published article from each platform.

---

## Task 1: SKILL.md scaffold

**Files:**
- Create: `skills/post-analytics/SKILL.md`

- [ ] **Step 1: Create directories**

```bash
mkdir -p skills/post-analytics/prompts skills/post-analytics/references
```

- [ ] **Step 2: Write SKILL.md**

Create `skills/post-analytics/SKILL.md`:

````markdown
---
name: post-analytics
description: Reads engagement metrics for already-published posts (WeChat 公众号, X, Weibo) and writes them back into the ideas.jsonl ledger's outcome field. Re-uses the same Chrome profile as post-to-* skills (no new login required). Closes the idea-radar → writeflow → multi-publish → analytics flywheel. Use when user asks to "看数据", "分析阅读量", "post analytics", "engagement", "回看效果", "复盘", or wants to update the idea ledger with outcomes.
version: 0.1.0
metadata:
  openclaw:
    homepage: https://github.com/hl85/supper-creator
---

# Post Analytics

Read engagement numbers for published posts and write them back into the `ideas.jsonl` ledger.

## Invocation

```
/post-analytics [--ledger <path>] [--since <duration>] [--platforms wechat,x,weibo] [--row <id>] [--no-write]
```

| Flag | Default | Meaning |
|------|---------|---------|
| `--ledger` | `.supper-creator/idea-radar/ideas.jsonl` | Same file `idea-radar` writes |
| `--since` | `7d` | Only refresh outcomes for posts published within this window (older posts are stable) |
| `--platforms` | `wechat,x,weibo` | Subset to refresh |
| `--row` | (none) | Refresh exactly one ledger row by `id` (otherwise scan all in `--since` window) |
| `--no-write` | off | Print what would be written without modifying the ledger |

## Trigger condition

A ledger row is eligible for analytics refresh when:

1. `claimed_by` is non-null (writeflow has drafted it).
2. `outcome` either is null OR is older than 24h (stamped via `outcome.measured_at`).
3. `outcome.<platform>.url` is present for the platform we're reading (multi-publish writes it on success).
4. The publish timestamp falls within `--since`.

If a row has no published URL for a platform, skip silently (probably a draft-only run).

## Outcome schema

The skill **rewrites** the `outcome` field on each eligible row (it's not append-only — but the ledger is JSONL, so we still rewrite the whole file once per run with all rows preserved):

```json
{
  "outcome": {
    "measured_at": "2026-04-30T07:00:00Z",
    "wechat": {
      "url": "https://mp.weixin.qq.com/s/abc",
      "reads": 1240,
      "shares": 32,
      "likes": 87,
      "wow": 14,
      "in_collection": 9,
      "followers_gained": 4
    },
    "x": {
      "url": "https://x.com/me/status/123",
      "tweet_ids": ["123","124","125"],
      "impressions": 24800,
      "engagements": 612,
      "replies": 8,
      "reposts": 47,
      "bookmarks": 31,
      "profile_visits": 92
    },
    "weibo": {
      "url": "https://weibo.com/123/abc",
      "reads": 5800,
      "reposts": 4,
      "comments": 2,
      "likes": 41
    }
  }
}
```

Per-platform sub-objects are independent — a partial failure on one platform leaves the others' numbers untouched.

## What this skill does NOT do

- **Doesn't compute scores or rankings** — leaves the raw numbers; downstream analysis (or `idea-radar`'s next scoring run) decides what they mean.
- **Doesn't post or republish** — read-only on the platforms.
- **Doesn't create ledger rows** — only updates rows that `idea-radar` + `multi-publish` have already created.
- **Doesn't track per-tweet thread breakdown beyond the IDs and aggregate impressions** — finer-grained tweet analytics are out of scope for v0.1.0.

## Pairing with `loop` / `schedule`

```
/loop 12h /post-analytics                # refresh twice a day
/schedule "0 8,20 * * *" /post-analytics # 8am + 8pm
```

After 7 days a post's numbers stabilize and refreshing buys little — the `--since 7d` default reflects that.

## References

- [prompts/pull-wechat.md](prompts/pull-wechat.md)
- [prompts/pull-x.md](prompts/pull-x.md)
- [prompts/pull-weibo.md](prompts/pull-weibo.md)
- [references/metrics.md](references/metrics.md)
````

- [ ] **Step 3: Verify YAML**

```bash
test -f skills/post-analytics/SKILL.md && head -5 skills/post-analytics/SKILL.md
```

Expected: 4 YAML lines.

- [ ] **Step 4: Commit**

```bash
git add skills/post-analytics/SKILL.md
git commit -m "feat(post-analytics): scaffold skill"
```

---

## Task 2: WeChat pull procedure

**Files:**
- Create: `skills/post-analytics/prompts/pull-wechat.md`

- [ ] **Step 1: Write the procedure**

Create `skills/post-analytics/prompts/pull-wechat.md`:

````markdown
# Pull Procedure — WeChat 公众号

Read engagement numbers for a single 公众号 article URL.

## Required input

- `article_url` — the published `https://mp.weixin.qq.com/s/...` URL

## Auth model

- **Authoritative numbers** live in the 公众号后台 (`mp.weixin.qq.com/cgi-bin/...`) which requires the publisher's login. Re-use the existing CDP profile that `post-to-wechat` uses — do **not** spawn a new Chrome.
- **Public-visible numbers** (阅读量, 在看, likes) appear at the bottom of the public article page. These are visible without login and can be fetched via Jina Reader.

## Strategy

1. **Try public-page first** — cheap, no auth.

   ```
   curl -s "https://r.jina.ai/<article_url>"
   ```

   Parse the trailing block for:
   - `阅读 <n>` → `reads`
   - `在看 <n>` → `wow`
   - `点赞 <n>` → `likes`
   - `分享 <n>` → `shares` (only sometimes shown publicly)

   If all four found, you can stop here.

2. **Fall back to 后台** when public numbers are missing or you also need follower-gained / collection counts.

   - Connect to the existing CDP session via `post-to-wechat`'s helper (same `SC_CHROME_PROFILE_DIR`).
   - Open `https://mp.weixin.qq.com/cgi-bin/home`.
   - Navigate: 数据 → 内容分析 → 单篇分析 → search by article title.
   - Read the metric cards. Map fields per `references/metrics.md`.

## Mapping to outcome.wechat

```
reads               → outcome.wechat.reads
shares              → outcome.wechat.shares (转发)
likes               → outcome.wechat.likes (点赞)
wow                 → outcome.wechat.wow (在看)
in_collection       → outcome.wechat.in_collection (收藏)
followers_gained    → outcome.wechat.followers_gained (新增关注 since publish)
```

If a metric is unavailable on either path, leave the field absent (not 0) — distinguishes "we couldn't read it" from "really zero".

## Anti-patterns

- ❌ Spawning a fresh Chrome for the 后台 — collides with active `post-to-wechat` sessions.
- ❌ Logging the user out / clearing cookies in the profile.
- ❌ Treating Jina Reader's "0" as authoritative when the bottom block is just slow to render — re-fetch once after 5s if the page is < 1KB.
- ❌ Filling unavailable numbers as `0` (lies about engagement).
- ❌ Reading 全部文章 / 整体数据 — this skill is per-article only.
````

- [ ] **Step 2: Commit**

```bash
git add skills/post-analytics/prompts/pull-wechat.md
git commit -m "feat(post-analytics): wechat pull procedure"
```

---

## Task 3: X pull procedure

**Files:**
- Create: `skills/post-analytics/prompts/pull-x.md`

- [ ] **Step 1: Write the procedure**

Create `skills/post-analytics/prompts/pull-x.md`:

````markdown
# Pull Procedure — X (Twitter)

Read engagement numbers for a single X post (or thread).

## Required input

- `tweet_url` — root tweet URL `https://x.com/<handle>/status/<id>`
- (optional) `tweet_ids` — list of all tweet IDs in the thread, if known. multi-publish writes these into `outcome.x.tweet_ids` after publish.

## Auth model

X analytics live at `https://analytics.x.com/...` for the **author** and require login. Per-tweet impression counts are also visible **on the tweet itself** to anyone (since 2023) but other engagement breakdowns (profile visits, link clicks, video views) are author-only.

Re-use the CDP profile that `post-to-x` uses — same `SC_CHROME_PROFILE_DIR`, same logged-in account.

## Strategy

1. **Per-tweet impressions and engagement counts** — visible on the tweet page itself. For each tweet ID:

   - Open `https://x.com/i/web/status/<id>` in the existing CDP session.
   - Wait for the metrics row at the bottom of the tweet to load (selectors: `[role="group"][aria-label*="View"]` and friends — selectors are unstable; prefer reading the `aria-label` of the metrics row which encodes all numbers in one string like `"24800 views, 47 reposts, 8 replies, 86 likes, 31 bookmarks"`).
   - Parse the aria-label.

2. **Author-only counters** (profile visits, link clicks):

   - Open `https://analytics.x.com/user/<handle>/tweet/<id>` (the analytics deep link). Renders only when logged in as `<handle>`.
   - Read the cards for `Profile visits`, `Link clicks` if the post had a link.

3. **Thread aggregation** — when `tweet_ids` has > 1 entry:

   - `impressions` = max across tweets (X reports impressions per tweet; the hook tweet is usually max and approximates thread impressions).
   - `engagements` = sum of `replies + reposts + likes + bookmarks` across tweets.
   - `replies / reposts / bookmarks / likes` = sum across tweets.
   - `profile_visits` = the analytics page reports a single thread-level number, prefer that over summing.

## Mapping to outcome.x

```
impressions       → outcome.x.impressions
engagements       → outcome.x.engagements
replies           → outcome.x.replies
reposts           → outcome.x.reposts
likes             → outcome.x.likes
bookmarks         → outcome.x.bookmarks
profile_visits    → outcome.x.profile_visits
```

Leave fields absent (not 0) when unavailable.

## Anti-patterns

- ❌ Hitting Twitter's REST API (`api.twitter.com`) — costs money and we already have the logged-in browser.
- ❌ Waiting forever for the metrics row to render — 10s timeout, then mark the row "render-failed" and move on.
- ❌ Selector-based scraping that doesn't fall back to aria-label string parsing — selectors break weekly.
- ❌ Pulling per-tweet text — that's not analytics, and we already have it from the thread.json that multi-publish wrote.
````

- [ ] **Step 2: Commit**

```bash
git add skills/post-analytics/prompts/pull-x.md
git commit -m "feat(post-analytics): x pull procedure"
```

---

## Task 4: Weibo pull procedure

**Files:**
- Create: `skills/post-analytics/prompts/pull-weibo.md`

- [ ] **Step 1: Write the procedure**

Create `skills/post-analytics/prompts/pull-weibo.md`:

````markdown
# Pull Procedure — Weibo

Read engagement numbers for a single Weibo post.

## Required input

- `post_url` — `https://weibo.com/<uid>/<post-id>` style URL

## Auth model

- **Public counts** (转发 / 评论 / 点赞 / 阅读) are visible on the post page without login.
- The "阅读" 阅读量 typically only shows on the **mobile** page (`m.weibo.cn/status/<id>`) for some accounts.

## Strategy

1. **Mobile public page first** — most reliable.

   ```
   curl -s -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15" "https://m.weibo.cn/status/<id>"
   ```

   Look for inline JSON with `attitudes_count`, `comments_count`, `reposts_count`. The 阅读量 is sometimes in a separate field `reads_count` or `view_count`.

2. **Desktop page via Jina** as a fallback:

   ```
   curl -s "https://r.jina.ai/<post_url>"
   ```

3. **Logged-in 数据中心** for accounts with V verification:

   - Re-use `post-to-weibo`'s CDP profile.
   - Open `https://weibo.com/ajax/profile/info?uid=<uid>` to confirm session, then navigate to data center.
   - Stable per-post numbers including unique reach.

## Mapping to outcome.weibo

```
reads     → outcome.weibo.reads
reposts   → outcome.weibo.reposts (转发)
comments  → outcome.weibo.comments (评论)
likes     → outcome.weibo.likes (点赞)
```

## Anti-patterns

- ❌ Hitting `weibo.com/ajax/...` without the session cookies — returns 403 / login redirect.
- ❌ Using the desktop page when the mobile page is more reliable.
- ❌ Confusing "热度" (a derived score) with raw `reads`.
- ❌ Trusting Jina Reader's stale cache — the URL is publicly cacheable, results may be > 1h old. For fresh numbers, prefer the mobile page directly.
````

- [ ] **Step 2: Commit**

```bash
git add skills/post-analytics/prompts/pull-weibo.md
git commit -m "feat(post-analytics): weibo pull procedure"
```

---

## Task 5: Metrics reference

**Files:**
- Create: `skills/post-analytics/references/metrics.md`

- [ ] **Step 1: Write the reference**

Create `skills/post-analytics/references/metrics.md`:

````markdown
# Cross-Platform Metric Reference

Canonical metric names that appear in the `outcome.<platform>` sub-object. Different platforms expose different subsets — this table makes the mapping explicit so downstream analysis (e.g., next `idea-radar` scoring round, or a future dashboard) can compare platforms cleanly.

## Universal metrics (all platforms)

| Canonical name | Meaning | Notes |
|----------------|---------|-------|
| `url` | The published post URL | Set by `multi-publish`; analytics never changes it |
| `measured_at` | When this row was refreshed | ISO 8601 UTC |

## Reach

| Canonical | WeChat | X | Weibo |
|-----------|--------|---|-------|
| `reads` | 阅读量 | (n/a; X uses impressions) | 阅读 |
| `impressions` | (n/a — 公众号 doesn't expose) | impressions | (sometimes via 数据中心) |

Treat `reads` and `impressions` as **distinct** — `reads` implies opened/viewed the article body; `impressions` includes timeline scroll-by views.

## Reaction

| Canonical | WeChat | X | Weibo |
|-----------|--------|---|-------|
| `likes` | 点赞 | likes | 点赞 |
| `wow` | 在看 | (n/a) | (n/a) |
| `bookmarks` | (n/a publicly) | bookmarks | (n/a publicly) |
| `in_collection` | 收藏 (后台 only) | (n/a) | (n/a) |

## Distribution

| Canonical | WeChat | X | Weibo |
|-----------|--------|---|-------|
| `shares` | 分享 (转发) | (n/a, "reposts" is the X term) | (n/a, see reposts) |
| `reposts` | (n/a, see shares) | reposts | 转发 |
| `replies` | (n/a; comments are unsupported here) | replies | (we don't capture in v0.1.0) |
| `comments` | (n/a) | (n/a, see replies) | 评论 |

Note: `replies` (X) and `comments` (Weibo) are conceptually the same; we keep the platform-native term to avoid silent collapse.

## Acquisition

| Canonical | WeChat | X | Weibo |
|-----------|--------|---|-------|
| `followers_gained` | 后台 only — relative since publish | (deprecated; not exposed reliably 2024+) | (n/a) |
| `profile_visits` | (n/a) | yes | (n/a) |
| `link_clicks` | (n/a; 公众号 strips outbound) | yes (if a link in the tweet) | (n/a) |

## Engagement aggregate

| Canonical | Definition |
|-----------|------------|
| `engagements` | Sum of reactions + distributions + replies. X exposes this directly; for WeChat / Weibo we **compute** it: `likes + shares + (wow if WeChat) + comments` |

## Stability windows

| Platform | Numbers stable after |
|----------|----------------------|
| WeChat   | 7 days (long-tail public-account reads) |
| X        | 48 hours (timeline halflife) |
| Weibo    | 5 days |

`--since 7d` (skill default) covers the WeChat window; for X-only you can pass `--since 48h` to save calls.

## Anti-patterns

- ❌ Coalescing `reads` and `impressions` into a single field — they measure different things.
- ❌ Treating "0" and "missing" as the same — a missing field means "not measured", a 0 means "really zero".
- ❌ Renaming WeChat 在看 to "likes" (it's a separate signal, more like "publicly endorse to network").
````

- [ ] **Step 2: Commit**

```bash
git add skills/post-analytics/references/metrics.md
git commit -m "feat(post-analytics): metrics reference"
```

---

## Task 6: Marketplace registration

**Files:**
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Add `./skills/post-analytics`**

Existing order around the `post-*` cluster (after the recent rebases):
```json
        "./skills/post-to-weibo",
        "./skills/post-to-wechat",
        "./skills/post-to-x",
```

Insert `post-analytics` immediately before `post-to-weibo` (alphabetical within the cluster):

```json
        "./skills/post-analytics",
        "./skills/post-to-weibo",
        "./skills/post-to-wechat",
        "./skills/post-to-x",
```

- [ ] **Step 2: Verify JSON parses**

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "feat(post-analytics): register skill in marketplace"
```

---

## Task 7: Smoke verification

**Files:**
- (read-only)

- [ ] **Step 1: Layout check**

```bash
ls skills/post-analytics/
ls skills/post-analytics/prompts/
ls skills/post-analytics/references/
```

Expected:
```
SKILL.md  prompts  references
pull-wechat.md  pull-x.md  pull-weibo.md
metrics.md
```

- [ ] **Step 2: Cross-link sanity**

```bash
grep -cE "prompts/pull-wechat|prompts/pull-x|prompts/pull-weibo|references/metrics" skills/post-analytics/SKILL.md
```

Expected: ≥ 4.

- [ ] **Step 3: Trigger phrase coverage**

```bash
grep -oE "看数据|分析阅读量|post analytics|engagement|回看效果|复盘" skills/post-analytics/SKILL.md | sort -u
```

Expected: ≥ 4 distinct triggers.

- [ ] **Step 4: Pipeline-neighbor naming**

```bash
grep -oE "idea-radar|writeflow|multi-publish|post-to-wechat|post-to-x|post-to-weibo|loop|schedule|content-review" skills/post-analytics/SKILL.md | sort -u
```

Expected: ≥ 4 distinct neighbors named (proves the skill stitches into the flywheel: `idea-radar`, one or more `post-to-*`, plus `loop`/`schedule`).

- [ ] **Step 5: Profile-sharing acknowledgment**

```bash
grep -hoE "SC_CHROME_PROFILE_DIR|same Chrome profile|re-use.*post-to" skills/post-analytics/SKILL.md skills/post-analytics/prompts/*.md | head
```

Expected: at least one match — proves the skill uses the shared profile rather than spawning a new browser session.

- [ ] **Step 6: No commit**

This task is read-only verification.

---

## Self-Review Notes

- **Spec coverage:** scaffold (T1) + per-platform pull procedures × 3 (T2–T4) + canonical metrics reference (T5) + marketplace (T6) + smoke (T7). Each deliverable from the original improvement plan — read public + back-office numbers, write back into `ideas.jsonl`, share Chrome profile with `post-to-*`, pair with `loop`/`schedule` — maps to a task.
- **Placeholder scan:** No "TBD". Every platform has explicit URL templates, fallback strategy, and selector-stability hedges. Outcome schema is fully written.
- **Type consistency:** `outcome` schema defined once in SKILL.md and consumed identically in all three pull prompts. Metric names match SKILL.md ↔ pull prompts ↔ `references/metrics.md` (verified cross-referencing canonical-name column). Ledger field names (`claimed_by`, `outcome.measured_at`, etc.) match the `idea-radar` ledger schema established in the prior plan.
- **Risks:**
  - X removed public follower-gained tracking; documented as "n/a" in metrics.
  - Selector-based scraping breaks; mitigated by aria-label fallback in `pull-x.md`.
  - Per-tweet thread breakdown is shallow (sum + max of impressions); deeper per-tweet drilldown is out of scope for v0.1.0.
