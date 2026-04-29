# Per-Platform Adapters

How to turn a single source `article.md` into each platform's expected input.

`{baseDir}` = the source-article directory. `${BUN_X}` = `bun` if installed, else `npx -y bun`. `<out-dir>` = the multi-publish out-dir for the current run.

## WeChat

**Target:** styled HTML with bottom-citation external links and inline images.

```
${BUN_X} skills/markdown-to-html/scripts/main.ts \
  <article.md> \
  -o <out-dir>/wechat/article.html \
  --theme default \
  --convert-links bottom-citations
```

Notes:
- `--convert-links bottom-citations` is the WeChat-friendly default; in-body links are unclickable on 公众号.
- If the article has no front-matter `title`, derive it from the first H1 of the markdown.
- Local image references (`![alt](./img.png)`) → copy to `<out-dir>/wechat/images/` and rewrite paths to relative `images/img.png`.

## X

**Target:** `thread.json` array consumable by `post-to-x`.

```
${BUN_X} skills/markdown-to-thread/scripts/main.ts \
  <article.md> \
  -o <out-dir>/x/thread.json \
  --hook auto \
  --cta "Full post 👇" \
  --number on \
  --max-len 270
```

Notes:
- The CTA appended on the final tweet should include the WeChat permalink **only after** WeChat has been published in live mode; in draft mode use a placeholder `"Full post 👇 (link pending)"` and tell the user.
- Images embedded in markdown are NOT lifted into the thread — X images need explicit handling. If the article has 1–4 images, list them in `<out-dir>/x/images.txt` and tell the user to attach them manually before publish (v0.1.0 limitation).

## Weibo

**Target:** ≤ 140 字 short post if the article ≤ 140 字, otherwise a "长微博" markdown that `post-to-weibo` can render to image.

```
# short-post path (article body ≤ 140 chars):
cp <article.md> <out-dir>/weibo/post.md

# long-post path (> 140 chars):
${BUN_X} skills/markdown-to-html/scripts/main.ts \
  <article.md> \
  -o <out-dir>/weibo/long-post.html \
  --theme weibo
```

Notes:
- Weibo's "长微博" feature renders long markdown into a single image. The publisher accepts either the markdown or the rendered HTML; prefer markdown.
- For short posts, append the WeChat permalink (in live mode) at the end so 微博 readers can jump to the long version.

## Image compression hook

After every adapter, scan its output directory for `*.png|*.jpg|*.jpeg|*.webp`. For each, run:

```
${BUN_X} skills/compress-image/scripts/main.ts \
  <image> \
  --max-size <platform-limit>
```

Replace in-place. The adapter output already references these files by path, so no rewrite is needed.

## Anti-patterns

- ❌ Re-running an adapter without checking the previous output (idempotency: if `<out-dir>/<platform>/article.html` exists, ask before overwriting)
- ❌ Embedding the article's WeChat backlink in the X thread before WeChat has published
- ❌ Using `--theme default` for Weibo — Weibo doesn't render WeChat themes well; use `--theme weibo`
- ❌ Forgetting to copy local images for WeChat (broken images on 公众号 草稿)
