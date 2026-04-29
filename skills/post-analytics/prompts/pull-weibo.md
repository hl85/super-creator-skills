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
