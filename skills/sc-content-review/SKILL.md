---
name: sc-content-review
description: Audits an article before publishing. Runs three passes — compliance (platform red lines), factcheck (numbers/quotes/links via agent-reach), and link-health — then emits a Markdown report with severity-tagged issues. Tuned per platform (wechat | x). Does not rewrite the article. Use when user asks to "审一下这篇", "review this article", "检查合规", "fact check", "敏感词检查", or before any /sc-post-to-wechat or /sc-post-to-x invocation. [Beta]
version: 0.1.0
---

# Content Review

Pre-publish audit for articles across three dimensions: Compliance, Fact-check, and Link Health.

## Usage

> ⚠️ **Beta** — 此 skill 通过 Claude 对话调用（prompt 驱动），以下 CLI 命令仅作参考，尚未实现。

This skill is driven via prompt orchestration. Invoke it by describing what you need in the conversation.

```bash
# [示例，暂不可用] Audit an article (auto-detect platform)
# [示例，暂不可用] ./sc-run sc-content-review audit article.md

# [示例，暂不可用] Audit specifically for WeChat
# [示例，暂不可用] ./sc-run sc-content-review audit article.md --platform wechat

# [示例，暂不可用] Audit a URL
# [示例，暂不可用] ./sc-run sc-content-review audit https://example.com/post
```

## Intents

- **Compliance Audit**: Check for platform-specific red lines (politics, medical, shadowban terms).
- **Fact-checking**: Verify numbers, entities, and claims via web search (`agent-reach`).
- **Link Health**: Verify URL reachability and accessibility.

## Progressive Disclosure

For detailed audit schemas, severity definitions, and platform red lines, see:

- [references/report-format.md](references/report-format.md) - **Report Schema & Severity Levels**
- [references/wechat-redlines.md](references/wechat-redlines.md) - **WeChat Compliance Rules**
- [references/x-redlines.md](references/x-redlines.md) - **X (Twitter) Compliance Rules**
- [prompts/compliance.md](prompts/compliance.md) - **Compliance Prompt Logic**
- [prompts/factcheck.md](prompts/factcheck.md) - **Fact-check Prompt Logic**
