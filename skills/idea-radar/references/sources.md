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
