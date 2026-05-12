---
name: post-analytics
description: Reads engagement metrics for already-published posts (WeChat 公众号, X, Weibo) and writes them back into the ideas.jsonl ledger's outcome field. Re-uses the same Chrome profile as post-to-* skills (no new login required). Closes the idea-radar → writeflow → multi-publish → analytics flywheel. Use when user asks to "看数据", "分析阅读量", "post analytics", "engagement", "回看效果", "复盘", or wants to update the idea ledger with outcomes.
version: 0.1.0
---

# Post Analytics

Updates the `ideas.jsonl` ledger with real-world engagement metrics (reads, shares, likes) from WeChat, X, and Weibo.

## Usage

All commands use `./sc-run post-analytics main`.

```bash
# Refresh metrics for the last 7 days
./sc-run post-analytics main --since 7d

# Refresh specific platform
./sc-run post-analytics main --platforms wechat

# Refresh specific row by ID
./sc-run post-analytics main --row <sha1-id>

# Dry run (print only)
./sc-run post-analytics main --no-write
```

## Intents

- **Metric Refresh**: Pull fresh data for recently published posts.
- **Ledger Synchronization**: Write engagement back into the central idea store.
- **Engagement Analysis**: Provide raw numbers for WeChat, X (Twitter), and Weibo.

## Progressive Disclosure

For detailed outcome schemas, eligibility rules, and metric definitions, see:

- [references/outcome-schema.md](references/outcome-schema.md) - **JSON Ledger Fields**
- [references/metrics.md](references/metrics.md) - **Platform Metric Definitions**
- [prompts/pull-wechat.md](prompts/pull-wechat.md) - **WeChat Extraction Logic**
- [prompts/pull-x.md](prompts/pull-x.md) - **X Extraction Logic**
