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
