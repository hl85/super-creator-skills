# Pull Procedure — WeChat 公众号

Read engagement numbers for a single 公众号 article URL.

## Required input

- `article_url` — the published `https://mp.weixin.qq.com/s/...` URL

## Auth model

- **Authoritative numbers** live in the 公众号后台 (`mp.weixin.qq.com/cgi-bin/...`) which requires the publisher's login. Re-use the existing CDP profile that `post-to-wechat` uses — do **not** spawn a new Chrome. `SC_CHROME_PROFILE_DIR` controls the shared profile.
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
