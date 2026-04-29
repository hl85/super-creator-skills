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
