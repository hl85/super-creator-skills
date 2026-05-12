---
name: post-analytics
description: Reads engagement metrics for already-published posts (WeChat 公众号, X, Weibo) and writes them back into the ideas.jsonl ledger's outcome field. Re-uses the same Chrome profile as post-to-* skills (no new login required). Closes the idea-radar → writeflow → multi-publish → analytics flywheel. Use when user asks to "看数据", "分析阅读量", "post analytics", "engagement", "回看效果", "复盘", or wants to update the idea ledger with outcomes. [Beta]
version: 0.1.0
---

# Post Analytics

Updates the `ideas.jsonl` ledger with real-world engagement metrics (reads, shares, likes) from WeChat, X, and Weibo.

## Usage

> ⚠️ **Beta** — 此 skill 通过 Claude 对话调用（prompt 驱动），以下 CLI 命令仅作参考，尚未实现。

This skill is driven via prompt orchestration. Invoke it by describing what you need in the conversation.

```bash
# [示例，暂不可用] Refresh metrics for the last 7 days
# [示例，暂不可用] ./sc-run post-analytics main --since 7d

# [示例，暂不可用] Refresh specific platform
# [示例，暂不可用] ./sc-run post-analytics main --platforms wechat

# [示例，暂不可用] Refresh specific row by ID
# [示例，暂不可用] ./sc-run post-analytics main --row <sha1-id>

# [示例，暂不可用] Dry run (print only)
# [示例，暂不可用] ./sc-run post-analytics main --no-write
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
