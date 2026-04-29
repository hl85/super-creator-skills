# content-review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new pure-prompt `content-review` skill that audits an article for compliance, factual risk, and link health before publishing — separately tuned for WeChat (公众号) and X.

**Architecture:** Zero TypeScript code. The skill is a `SKILL.md` plus `references/` (red-line word lists per platform) and `prompts/` (factcheck + compliance review templates). The agent itself does the reasoning, calling `agent-reach` for fact verification when needed. Output is a Markdown review report (no auto-rewrite, human keeps final say).

**Tech Stack:** Markdown + YAML front matter only. No build step, no scripts.

---

## File Structure

```
skills/content-review/
├── SKILL.md                       # entry: routing + invocation contract
├── references/
│   ├── wechat-redlines.md         # 公众号 sensitive categories + word seeds
│   └── x-redlines.md              # X shadowban-prone phrases, irony/legal risks
└── prompts/
    ├── compliance.md              # red-line scan procedure
    └── factcheck.md               # numeric/quote/link verification procedure
```

Responsibilities:
- **`SKILL.md`** — Defines `name`/`description`/`triggers`, the CLI-style invocation grammar, the report schema, and the routing rule that picks `wechat` vs `x` red-line bundle.
- **`references/*-redlines.md`** — Categorized red-line lists. Categories not raw blacklists (the agent infers similar phrases), seeded with concrete examples.
- **`prompts/compliance.md`** — Step-by-step procedure the agent follows when running a compliance scan. Defines severity levels and the report schema.
- **`prompts/factcheck.md`** — Procedure for extracting claims (numbers, dates, named entities, quoted statements, hyperlinks), verifying via `agent-reach`, and grading confidence.

No tests required (no executable code). Validation is by example: a sample article round-trips through the skill and produces a report.

---

## Task 1: Skill scaffold and SKILL.md

**Files:**
- Create: `skills/content-review/SKILL.md`

- [ ] **Step 1: Create skill directory and SKILL.md**

```bash
mkdir -p skills/content-review/references skills/content-review/prompts
```

Create `skills/content-review/SKILL.md`:

````markdown
---
name: content-review
description: Audits an article before publishing. Runs three passes — compliance (platform red lines), factcheck (numbers/quotes/links via agent-reach), and link-health — then emits a Markdown report with severity-tagged issues. Tuned per platform (wechat | x). Does not rewrite the article. Use when user asks to "审一下这篇", "review this article", "检查合规", "fact check", "敏感词检查", or before any /post-to-wechat or /post-to-x invocation.
version: 0.1.0
metadata:
  openclaw:
    homepage: https://github.com/hl85/supper-creator
---

# Content Review

Pre-publish audit for an article. Three passes:

| Pass | What it checks |
|------|----------------|
| **compliance** | Red lines per platform (政治 / 医疗 / 金融 / 涉黄涉暴 for WeChat; 法律风险 / 反讽误读 / shadowban 词 for X) |
| **factcheck** | Numbers, dates, named entities, quoted statements — verified via `agent-reach` web search |
| **link-health** | URLs reachable; no obvious paywall/login redirects |

Outputs a Markdown report. **Never** auto-rewrites the article.

## Invocation

```
/content-review <article.md|url> [--platform wechat|x] [--passes compliance,factcheck,links] [-o report.md]
```

Default `--platform` is inferred:
- `.md` containing CJK ≥ 30% → `wechat`
- `.md` < 30% CJK or short (≤ 2000 chars) → `x`
- URL → fetch first via `url-to-markdown`, then re-run inference

Default `--passes` is all three.

## What the agent does (no scripts)

1. Read the article (use `url-to-markdown` if URL).
2. Read the right red-line reference for the platform.
3. Follow `prompts/compliance.md` step by step.
4. Follow `prompts/factcheck.md` for each verifiable claim. Use `agent-reach` for searches; do not fabricate citations.
5. For each link in the article, run a `curl -sI -o /dev/null -w "%{http_code}" <url>` style check (or use `agent-reach` web read), record status.
6. Emit a single Markdown report (see schema below).

## Report Schema

```markdown
# Content Review — <article title>

**Platform:** wechat | x
**Verdict:** PASS | REVIEW | BLOCK
**Generated:** YYYY-MM-DD HH:MM

## Compliance ([N] issues)

### [BLOCK] <category> — line <n>
> <quoted excerpt>
**Why:** <one sentence>
**Fix:** <suggested rewrite or removal>

### [REVIEW] ...

## Factcheck ([N] claims)

### [REVIEW] <claim>
**Source(s):** <URLs>
**Verdict:** unsupported | partially-supported | supported | contradicted
**Note:** <one sentence>

## Links ([N] checked)

| URL | Status | Note |
|-----|--------|------|
| ... | 200 | ok |
| ... | 403 | requires login |
```

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **BLOCK** | Almost certain rejection / takedown / legal risk | Author MUST fix before publishing |
| **REVIEW** | Likely safe but needs human eyes | Author should reread and decide |
| **PASS** | No issue found | No action |

The overall verdict is the worst single severity across all passes.

## References

- [references/wechat-redlines.md](references/wechat-redlines.md)
- [references/x-redlines.md](references/x-redlines.md)
- [prompts/compliance.md](prompts/compliance.md)
- [prompts/factcheck.md](prompts/factcheck.md)
````

- [ ] **Step 2: Verify file exists and YAML parses**

```bash
test -f skills/content-review/SKILL.md && echo OK
head -5 skills/content-review/SKILL.md
```

Expected: `OK` and the four YAML lines `name`, `description`, `version`, `metadata` visible.

- [ ] **Step 3: Commit**

```bash
git add skills/content-review/SKILL.md
git commit -m "feat(content-review): scaffold skill"
```

---

## Task 2: WeChat red-line reference

**Files:**
- Create: `skills/content-review/references/wechat-redlines.md`

- [ ] **Step 1: Write the reference**

Create `skills/content-review/references/wechat-redlines.md`:

````markdown
# WeChat Official Account Red Lines

Categories below are not exhaustive blacklists. They are *seeds*: the reviewer should generalize from each example to similar phrasings, including paraphrases, abbreviations, English transliterations, and obfuscated forms (拼音首字母, homophones).

For every match, classify severity:

- **BLOCK** — politically sensitive content, content that violates Chinese law, medical claims with absolute language, financial inducements, sexual or violent content
- **REVIEW** — borderline cases (sarcasm about institutions, comparative product claims, unverified celebrity claims)

## 1. Political (BLOCK)

Examples to flag:
- 直接评价中国最高领导人 / 党中央 / 中央政府的具体决策（褒贬均属敏感）
- 涉及"六四"、"文革批判"、"新疆/西藏/香港/台湾"政治定性
- 攻击或讽刺解放军、公检法、宣传系统
- 提及被禁组织（FLG、东突等）
- 引用境外政治新闻而无中性语境

Seed phrases (do **not** treat as a literal blacklist; generalize):
"独裁", "暴政", "颜色革命", "和平演变", "维权律师"（特定语境）

## 2. Medical (BLOCK on absolute claims)

Examples to flag:
- "治愈"、"根治"、"100% 有效"、"无副作用" 等绝对化用词
- 推荐处方药、未经审批的疗法
- 把保健品/食品功效写成药品功效
- 引用"专家"无法核实的医学结论

## 3. Financial (BLOCK on inducement)

Examples to flag:
- 推荐具体股票/基金代码 + 时间窗（"下周必涨"）
- 承诺收益率（"年化 30%"）
- 引导加群、加微信、扫码"领免费课"
- 引用未持牌机构的投资建议

## 4. Sexual / Violent (BLOCK)

Examples to flag:
- 露骨性描写、性服务暗示
- 详细自杀方式、自残方法
- 美化暴力、恐怖袭击

## 5. Marketing-Spam Patterns (REVIEW)

Examples to flag (公众号反"诱导关注"机制会限流):
- "转发到三个群获取..."
- "点赞过 100 我就..."
- "在看 + 留言 + 转发 三连"
- 标题党：与正文不符、夸张数字

## 6. External-Link Behavior (REVIEW)

公众号正文中外链一般不可点击。审核时应：
- 标记所有非公众号生态外链
- 建议改为底部「参考链接」或二维码

## 7. Common False-Positive Pitfalls (do **not** flag)

- 历史人物的客观陈述（毛泽东、邓小平 的史实）
- 引用官方媒体原文（新华社、人民日报）并标注出处
- 中性的国际新闻报道
- 学术或法律语境下的专业术语（如医学论文里的"治愈率"）

````

- [ ] **Step 2: Commit**

```bash
git add skills/content-review/references/wechat-redlines.md
git commit -m "feat(content-review): add wechat redlines reference"
```

---

## Task 3: X red-line reference

**Files:**
- Create: `skills/content-review/references/x-redlines.md`

- [ ] **Step 1: Write the reference**

Create `skills/content-review/references/x-redlines.md`:

````markdown
# X (Twitter) Red Lines

X moderation is more permissive than WeChat on speech but stricter on **algorithmic distribution** (shadowban, reach throttling) and on **legal exposure** (defamation, doxxing). This list reflects 2024–2026 community-reported patterns, not official policy.

## 1. Shadowban / Reach-Throttle Triggers (REVIEW)

Examples to flag:
- 多个外链（X penalizes posts with off-platform links; 1 link is fine, 2+ noticeably hurts reach）
- 大量 hashtag（>2 tags 反而降权）
- 全大写 + 多个感叹号（被分类为 spam-like）
- 发布频次过高（同主题 5 分钟内多条）
- 转发自己的帖子并加同样内容

## 2. Legal / Liability (BLOCK)

Examples to flag:
- 指名道姓的诽谤（"X is a fraud" 没有依据）
- 公开未公开的私人通讯截图（DM、私信、私人邮件）
- 透露他人住址、电话、单位（doxxing）
- 引用未经证实的犯罪指控
- 发布版权材料无授权（电影片段、付费课程截图）

## 3. Irony / Misreading Risk (REVIEW)

X 是高摘抄/高断章取义平台。任何一句话都可能被截图传播。审核应标记：
- 反讽句若被去掉上下文是否危险？（"我支持加税" 反讽 vs 字面）
- 自嘲句被陌生人误读为攻击的可能性？
- 政治笑话在不同时区/读者群的接受度？

When in doubt, suggest adding `/s` or restating literally.

## 4. Platform-Sensitive Topics (REVIEW)

Topics where X moderation has been inconsistent:
- COVID 相关医学声明
- 选举相关声明（特别是美国选举周期内）
- 跨性别 / 性别认同（双向风险）
- 以色列-巴勒斯坦
- 加密货币推荐（被标 spam 概率高）

## 5. Thread Quality Signals (REVIEW)

X 算法明显偏好"完整 thread"而非"末条带链接"。审核应标记：
- 钩子推（第一条）是否能独立读懂？
- 链接是否被压在最后一条而非中间？
- 是否过早 @ 大 V 求转发（被分类为 engagement bait）

## 6. Common False-Positive Pitfalls (do **not** flag)

- 引用公开新闻报道（即使敏感主题）
- 注明来源的事实陈述
- 第一人称的技术失败复盘（debug 故事）
- 学术 / 工程语境下的强语气

````

- [ ] **Step 2: Commit**

```bash
git add skills/content-review/references/x-redlines.md
git commit -m "feat(content-review): add x redlines reference"
```

---

## Task 4: Compliance prompt

**Files:**
- Create: `skills/content-review/prompts/compliance.md`

- [ ] **Step 1: Write the prompt procedure**

Create `skills/content-review/prompts/compliance.md`:

````markdown
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
````

- [ ] **Step 2: Commit**

```bash
git add skills/content-review/prompts/compliance.md
git commit -m "feat(content-review): add compliance procedure prompt"
```

---

## Task 5: Factcheck prompt

**Files:**
- Create: `skills/content-review/prompts/factcheck.md`

- [ ] **Step 1: Write the prompt procedure**

Create `skills/content-review/prompts/factcheck.md`:

````markdown
# Factcheck Pass Procedure

Verifies *checkable* claims via `agent-reach`. Does not opine on opinions.

## Step 1 — Extract claims

Read the article and extract claims that are **objectively verifiable**:

| Claim type | Examples |
|-----------|----------|
| Numeric | "GDP grew 5.2% in 2024", "1.4M users" |
| Dated event | "Released on March 12 2025" |
| Named-entity attribution | "Hinton said X", "OpenAI announced Y" |
| Quoted statement | Anything in “quotes” attributed to someone |
| External citation | "according to Nature, …" |

**Skip:**
- The author's own opinions
- Hypotheticals ("imagine if…")
- Common knowledge that doesn't need a citation ("water boils at 100°C")
- Anecdotes with no verifiable subject

Cap at **15 claims** per article. If more, pick the most consequential.

## Step 2 — Verify via agent-reach

For each claim, run a search:

```
mcporter call 'exa.web_search_exa(query: "<paraphrased claim>", numResults: 3)'
```

Or for source-specific claims:
```
mcporter call 'exa.web_search_exa(query: "<entity> <year> <topic>", numResults: 5)'
```

Read the top results (use the agent-reach `web` channel). Do **not** fabricate URLs.

## Step 3 — Grade each claim

Use exactly four verdicts:

| Verdict | Meaning |
|---------|---------|
| `supported` | At least 2 independent reputable sources confirm |
| `partially-supported` | Sources confirm part of the claim, but a number/date/attribution differs |
| `unsupported` | No reputable source found in 3 minutes of searching |
| `contradicted` | A reputable source says the opposite |

Treat `unsupported` and `contradicted` as **REVIEW** severity (let author decide). Only escalate to BLOCK if the claim is also defamatory or medical/financial advice.

## Step 4 — Emit the section

Each entry should include:

```markdown
### [REVIEW] <claim verbatim>
**Source(s):** <URL 1>, <URL 2>
**Verdict:** partially-supported
**Note:** Sources show 5.0% (IMF) not 5.2%; consider citing IMF directly.
```

## Step 5 — Link health subsection

Separately, for **every URL in the article body**:

```bash
curl -sI -L -o /dev/null -w "%{http_code} %{url_effective}\n" "<url>"
```

Or use `agent-reach` web read. Record final status code and effective URL (after redirects). Flag:
- 4xx / 5xx → **REVIEW** with note
- Redirected to login/paywall → **REVIEW**
- Different domain than expected → **REVIEW**

Render as a markdown table per the schema in SKILL.md.

## Anti-patterns the reviewer must avoid

- ❌ Fabricating URLs or pretending to have searched
- ❌ Marking a claim `supported` when only the author's own blog corroborates
- ❌ Spending more than ~3 minutes per claim
- ❌ Verifying opinions ("X is the best framework" is not factcheckable)
- ❌ Using `BLOCK` for factcheck issues unless legally risky
````

- [ ] **Step 2: Commit**

```bash
git add skills/content-review/prompts/factcheck.md
git commit -m "feat(content-review): add factcheck procedure prompt"
```

---

## Task 6: Register in marketplace

**Files:**
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Add `content-review` to the skills array**

Read `.claude-plugin/marketplace.json`. Add `"./skills/content-review"` keeping the array alphabetically sorted. It should sit between `./skills/comic` and `./skills/cover-image`:

```json
        "./skills/comic",
        "./skills/content-review",
        "./skills/cover-image",
```

- [ ] **Step 2: Verify JSON parses**

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "feat(content-review): register skill in marketplace"
```

---

## Task 7: Manual smoke test

**Files:**
- (none — read-only inspection)

- [ ] **Step 1: Verify the skill discovery surface**

```bash
ls skills/content-review/
ls skills/content-review/references/
ls skills/content-review/prompts/
```

Expected:
```
SKILL.md  prompts  references
wechat-redlines.md  x-redlines.md
compliance.md  factcheck.md
```

- [ ] **Step 2: Verify the SKILL.md description contains all required trigger phrases**

```bash
grep -E "审|review|fact check|敏感词" skills/content-review/SKILL.md
```

Expected: at least one match (proves the description hooks user-language triggers).

- [ ] **Step 3: Verify references cross-link from SKILL.md**

```bash
grep -E "references/wechat-redlines|references/x-redlines|prompts/compliance|prompts/factcheck" skills/content-review/SKILL.md
```

Expected: 4 lines.

- [ ] **Step 4: Sample dry-run (manual, no commit)**

Pick any markdown article in the repo (e.g. the just-created `markdown-to-thread` SKILL.md or a doc) and ask the agent in a fresh chat: "Use content-review on path/to/article.md, platform x". Confirm by hand that:

- The agent loads `references/x-redlines.md`
- It follows `prompts/compliance.md` order
- It emits the report schema
- It does NOT rewrite the article inline

This step is exploratory; no automation. If the agent deviates, tighten the prompts and re-commit.

- [ ] **Step 5: No commit needed for the smoke test**

---

## Self-Review Notes

- **Spec coverage:** scaffold (T1) + 2 red-line references (T2, T3) + 2 procedure prompts (T4, T5) + registration (T6) + smoke (T7). Each deliverable from the parent improvement proposal — compliance scan, factcheck, link health, platform-aware tuning, no-auto-rewrite — is covered.
- **Placeholder scan:** No "TBD" / "etc." / "fill in later". Every reference has concrete seeds; every prompt has explicit step ordering.
- **Type consistency:** No code, so no type drift. Severity vocabulary `BLOCK | REVIEW | PASS` is defined once in SKILL.md and reused identically in both prompts. Verdict vocabulary `supported | partially-supported | unsupported | contradicted` defined once in `factcheck.md`.
- **Risks:**
  - Red-line lists will go stale — they're seeds, not exhaustive, and the reviewer is told to generalize. Acceptable for v0.1.0.
  - The `curl` link-check command may need replacement on Windows; documented as a fallback to `agent-reach` web read.
