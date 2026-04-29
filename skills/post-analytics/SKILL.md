---
name: post-analytics
description: Reads engagement metrics for already-published posts (WeChat 公众号, X, Weibo) and writes them back into the ideas.jsonl ledger's outcome field. Re-uses the same Chrome profile as post-to-* skills (no new login required). Closes the idea-radar → writeflow → multi-publish → analytics flywheel. Use when user asks to "看数据", "分析阅读量", "post analytics", "engagement", "回看效果", "复盘", or wants to update the idea ledger with outcomes.
version: 0.1.0
metadata:
  openclaw:
    homepage: https://github.com/hl85/super-creator
---

# Post Analytics

Read engagement numbers for published posts and write them back into the `ideas.jsonl` ledger.

## Invocation

```
/post-analytics [--ledger <path>] [--since <duration>] [--platforms wechat,x,weibo] [--row <id>] [--no-write]
```

| Flag | Default | Meaning |
|------|---------|---------|
| `--ledger` | `.super-creator/idea-radar/ideas.jsonl` | Same file `idea-radar` writes |
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
