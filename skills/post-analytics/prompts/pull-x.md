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
