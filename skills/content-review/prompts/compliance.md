# Compliance Pass Procedure

Run **before** factcheck. Compliance issues block publishing regardless of fact accuracy.

## Step 1 — Load the right red-line reference

```
if platform == "wechat":
    load references/wechat-redlines.md
else:  # x
    load references/x-redlines.md
```

## Step 2 — Segment the article

Split the article into numbered sentences (or tweet-sized chunks for X). Keep line numbers from the source if possible — the report needs them.

## Step 3 — Per-segment scan

For each segment, ask in order:

1. **Does this segment match any seed phrase or category in the red-line reference?**
   - If yes → record a draft issue with `category`, `severity`, `excerpt`, `line`.
2. **Is this a generalization the seeds suggest? (paraphrase, English transliteration, obfuscation)**
   - If yes → same; mark `inferred: true`.
3. **Is this a false-positive pitfall listed in the reference?**
   - If yes → drop the draft issue.

## Step 4 — Severity calibration

For every kept issue, double-check severity:

| Severity | Hard rule |
|----------|-----------|
| BLOCK | Author cannot publish without changing this exact text |
| REVIEW | Author *might* publish unchanged but should re-read with intent |

If unsure, **downgrade to REVIEW**, never silently upgrade to BLOCK.

## Step 5 — Suggest fixes

For each issue, propose **one** concrete rewrite or removal. Keep the suggestion ≤ 50 words. Never write a full replacement paragraph — the author keeps editorial control.

## Step 6 — Emit the section

Use the schema in SKILL.md. Order issues by severity (BLOCK first), then by line number ascending.

## Anti-patterns the reviewer must avoid

- ❌ Copy-pasting the entire red-line list into the report
- ❌ Flagging every occurrence of a sensitive *word* without considering context (e.g., "维权律师" in a historical article is fine)
- ❌ Inventing categories not in the reference
- ❌ Rewriting the author's content silently — only **suggest** in the `Fix:` field
- ❌ Using BLOCK liberally; reserve it for true publish-stoppers
