# Draft Procedure — X Thread

Input: an outline produced by `outline-x-thread.md`. Output: a markdown document where each paragraph (separated by `\n\n`) is one tweet.

## Step 0 — Sanity check

Verify outline has Reader, Core claim, Counter-view, and a hook tweet ≤ 270 chars.

## Step 1 — Hook tweet (paragraph 1)

Copy the outline's hook. Re-tighten to ≤ 270 chars (1/N suffix is added later by `markdown-to-thread`, so leave 6–8 chars headroom).

The hook must be standalone-readable. Test: if a stranger sees only this on their timeline, would they tap?

## Step 2 — Body tweets

For each subsequent paragraph:

1. **One idea per tweet.** If you write 2, split.
2. **Open with a strong noun or verb**, not a pronoun ("That's why" → bad; "The cost" → good).
3. **Length ≤ 270 chars.** No exception.
4. **Specific over abstract.** Number > vague, name > "they", date > "recently".
5. Maintain the arc: setup (T2) → twist (T3) → evidence (T4–5) → edge case (T6) → takeaway (T7).

## Step 3 — Acknowledge counter-view

Exactly one tweet (typically T6) for the steelman. Format:

```
You might say: "<counter-view>".

Fair. But <one-line response>.
```

## Step 4 — Final tweet (CTA)

Pick from the outline's CTA. Pattern:

```
<one-line recap of the core claim>.

<single CTA: link OR question OR next step>
```

If linking: put the link **last** in this tweet, on its own line.

## Step 5 — Self-edit pass

For each tweet:
- Cut hashtags (>0 = throttle)
- Cut all-caps emphasis (use `*asterisks*` for italic instead, X renders as italic in some clients)
- Cut "Follow me for more"
- Remove "🧵👇"
- Remove emoji-stuffed line endings

## Step 6 — Length check

Run a mental tally. The thread should match the outline's planned tweet count ± 1. If you've grown to 14 when the outline was 8, you're padding — cut.

## Step 7 — Emit draft.md

Save with paragraphs separated by **double newlines** so `markdown-to-thread` packs them correctly:

```
Hook tweet here.

Setup tweet here.

Twist tweet here.

...

CTA tweet here.

https://link.com
```

Tell the user the next step:
> Pipe through `markdown-to-thread` to get the JSON, then `post-to-x` to publish.

## Anti-patterns

- ❌ Hook longer than 270
- ❌ "1/" inside the draft (numbering is added later)
- ❌ Two ideas merged because they fit
- ❌ Filler tweets ("Here's why ↓")
- ❌ More than 1 link in body
- ❌ Hashtags
- ❌ Final tweet without a recap line above the CTA
