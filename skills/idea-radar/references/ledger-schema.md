# Idea Radar: Ledger Schema

Persistent storage format for discovered content ideas.

## ideas.jsonl Schema
One JSON object per line.

```json
{
  "id": "sha1 hash",
  "found_at": "ISO-8601",
  "source": "category:name",
  "title": "...",
  "url": "...",
  "scores": {
    "writeability": 1-5,
    "novelty": 1-5,
    "wechat_fit": 1-5,
    "x_fit": 1-5
  },
  "verdict": "high|medium|low"
}
```

(See original SKILL.md for full field descriptions ...)
