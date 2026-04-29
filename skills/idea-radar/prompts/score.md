# Score Procedure

After dedupe, every surviving candidate gets a single LLM pass that fills the `scores` object and computes `verdict`.

## Rubric

For each candidate, score each dimension on **0–5**:

| Dimension | Question | 0 | 5 |
|-----------|----------|---|---|
| `writeability` | Could the user write a real article on this within their knowledge domain? | 几乎写不出 / 完全不熟 | 已有现成观点、能立刻动笔 |
| `novelty` | Has this been written-to-death? | 完全是 already-written 老话题 | 真正稀缺、3 个月内未见类似深度文章 |
| `wechat_fit` | Would 公众号读者点开 + 读完？ | 完全不匹配（外语硬技术 / 微小新闻） | 高匹配（中文深度 / 反共识 / 实用） |
| `x_fit` | Would this hook the X timeline in 1.5 seconds? | 不适合（长论证 / 中文为主） | 高（数字 / 反转 / 故事钩子） |
| `evidence_depth` | Are there enough concrete numbers / cases / quotes in the source to fill an article? | 只有标题 / 单段空话 | 多源、可量化、可引用 |

## Verdict

Compute:

```
sum = writeability + novelty
verdict =
  "high"   if sum >= 8
  "medium" if sum >= 5
  "low"    otherwise
```

`platform_fit` does **not** affect verdict — it tells the user *which* platform to target, not whether to write.

## Notes field

One sentence — what the angle would be. Examples:

- "反共识：大家都说 X 越大越好，但这家用 5B 击穿了 70B"
- "实用：从 0 到 1 把私房菜店搬上美团，3 个月血亏的复盘"
- "争议：Cursor 1.0 vs Windsurf 实测，反主流结论"

If `notes` is empty / generic ("interesting article"), the score is wrong — re-score.

## Cost discipline

This is one LLM pass over all candidates. **Don't** invoke `agent-reach` here for additional fact-checking — that's `content-review`'s job at draft time. Score only on the title + summary already in the candidate.

If a candidate's summary is < 50 chars, score `evidence_depth` ≤ 2 even if other dimensions are high — the article could be a thin wrapper.

## Anti-patterns

- ❌ Scoring without `notes` — if you can't write a one-line angle, the candidate is `low`.
- ❌ Always-5 inflation (everything trending is "high writeability") — calibrate against the user's known domain.
- ❌ Letting `wechat_fit` / `x_fit` collapse to a single average — they're independent on purpose.
- ❌ Bumping verdict because "the source is reputable" — reputation isn't writeability.
