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
