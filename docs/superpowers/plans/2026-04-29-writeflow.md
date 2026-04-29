# writeflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pure-prompt `writeflow` skill that takes raw source material and emits, in two stages, (1) a platform-tuned outline and (2) a publication-ready draft. Tuned for WeChat (公众号) long-form and X (Twitter) thread/article.

**Architecture:** Zero TypeScript. The skill is a `SKILL.md` plus `prompts/` (outline + draft procedures, per platform) and `references/` (style notes per platform — reader persona, structure, do/don't). The agent does the reasoning. Inputs are arbitrary markdown sources (already collected via `url-to-markdown` / `youtube-transcript` / `danger-x-to-markdown`); outputs are markdown files at user-specified paths.

**Tech Stack:** Markdown + YAML front matter only. No build step, no scripts.

---

## File Structure

```
skills/writeflow/
├── SKILL.md                          # entry: 2-stage routing + invocation grammar
├── prompts/
│   ├── outline-wechat.md             # 公众号 outline procedure
│   ├── outline-x-thread.md           # X thread outline procedure
│   ├── draft-wechat.md               # 公众号 draft procedure
│   └── draft-x-thread.md             # X thread draft procedure
└── references/
    ├── wechat-style.md               # 公众号 reader persona, rhythm, structure
    └── x-style.md                    # X algorithm signals, thread craft, length discipline
```

Responsibilities:
- **`SKILL.md`** — invocation grammar (`/writeflow outline <inputs> --platform ...`, `/writeflow draft <outline> --platform ...`), output file conventions, links into references/prompts.
- **`prompts/outline-*.md`** — step-by-step outline procedures: read sources → distill claim → identify reader → propose structure → emit outline schema.
- **`prompts/draft-*.md`** — step-by-step draft procedures: enforce platform constraints (paragraph length, hook, CTA, citation style), produce publish-ready markdown.
- **`references/*-style.md`** — what makes content perform on this platform; do/don't lists.

No tests required (pure prompts). Validation is by example: feed a sample source, run both stages, eyeball the output.

---

## Task 1: SKILL.md scaffold

**Files:**
- Create: `skills/writeflow/SKILL.md`

- [ ] **Step 1: Create skill directory**

```bash
mkdir -p skills/writeflow/prompts skills/writeflow/references
```

- [ ] **Step 2: Write SKILL.md**

Create `skills/writeflow/SKILL.md`:

````markdown
---
name: writeflow
description: Two-stage content authoring — turns raw source material (articles, transcripts, notes) into a platform-tuned outline, then into a publish-ready draft. Stage 1 (outline) distills the core claim, identifies the reader, and proposes structure. Stage 2 (draft) enforces platform constraints (公众号 long-form vs X thread). Does not collect sources (use url-to-markdown / youtube-transcript first) and does not publish (use post-to-wechat / post-to-x after). Use when user asks to "写大纲", "拟提纲", "写初稿", "写文章", "draft an article", "outline an article", "write a thread", or has source material and wants a draft.
version: 0.1.0
metadata:
  openclaw:
    homepage: https://github.com/hl85/supercreator
---

# Writeflow — Outline + Draft

Two stages. Always run them in order; the outline anchors the draft and prevents drift.

| Stage | Input | Output | What it does |
|-------|-------|--------|--------------|
| `outline` | one or more source files (markdown, transcripts, notes) | `outline.md` | Distill central claim; identify reader; propose structure |
| `draft` | the outline file (+ original sources if needed) | `draft.md` | Expand outline into publish-ready markdown for the chosen platform |

## Invocation

```
/writeflow outline <source...> --platform <wechat|x-thread> [-o outline.md] [--angle "..."]
/writeflow draft <outline.md>  --platform <wechat|x-thread> [-o draft.md] [--length short|medium|long]
```

- `<source>` accepts file paths or directories (recursive `*.md`).
- `--angle` optional one-line steer for the outline stage ("write it as a contrarian take", "frame around junior engineers").
- `--length` only meaningful for `wechat` (X thread length is governed by content, not flag).

## Stage 1: Outline

The agent follows the procedure in:
- WeChat: [prompts/outline-wechat.md](prompts/outline-wechat.md)
- X thread: [prompts/outline-x-thread.md](prompts/outline-x-thread.md)

The output `outline.md` always includes these sections:

```markdown
# Outline — <working title>

**Platform:** wechat | x-thread
**Angle:** <one sentence>
**Reader:** <one sentence — who, current belief, what they will gain>
**Core claim:** <one sentence — the single thing the piece argues>
**Counter-view:** <one sentence — the strongest objection>

## Structure

1. <hook / opener — what compels the reader to keep going>
2. <section title — one bullet per supporting point>
3. ...
N. <closer / CTA>

## Source map

- claim or fact → `<source-file>:#anchor` (or quote)
```

Refuse to emit a draft from anything missing **Reader**, **Core claim**, or **Counter-view** — those three force a non-trivial outline.

## Stage 2: Draft

The agent follows:
- WeChat: [prompts/draft-wechat.md](prompts/draft-wechat.md)
- X thread: [prompts/draft-x-thread.md](prompts/draft-x-thread.md)

The output `draft.md`:
- For `wechat`: a single markdown article with H1 title, opening hook ≤ 80 字, `##` sections, a closing CTA, and a `## 参考链接` section if the outline cited URLs.
- For `x-thread`: a markdown document with one paragraph per intended tweet, separated by blank lines. Pipe into `markdown-to-thread` for the JSON.

## What writeflow does NOT do

- **Doesn't collect sources** — use `url-to-markdown`, `youtube-transcript`, `danger-x-to-markdown`.
- **Doesn't fact-check or audit** — use `content-review` after drafting.
- **Doesn't generate images** — use `cover-image` / `article-illustrator` after drafting.
- **Doesn't publish** — use `post-to-wechat` / `post-to-x` after drafting.

## References

- [references/wechat-style.md](references/wechat-style.md)
- [references/x-style.md](references/x-style.md)
````

- [ ] **Step 3: Verify**

```bash
test -f skills/writeflow/SKILL.md && head -5 skills/writeflow/SKILL.md
```

Expected: 4 YAML lines (`name`, `description`, `version`, `metadata`).

- [ ] **Step 4: Commit**

```bash
git add skills/writeflow/SKILL.md
git commit -m "feat(writeflow): scaffold skill"
```

---

## Task 2: WeChat style reference

**Files:**
- Create: `skills/writeflow/references/wechat-style.md`

- [ ] **Step 1: Write the reference**

Create `skills/writeflow/references/wechat-style.md`:

````markdown
# WeChat 公众号 Style Reference

Style notes for long-form articles on 公众号. These shape both outline structure and draft prose.

## Reader persona

公众号 是 **认真读、长停留** 的场景。读者打开往往：
- 在通勤 / 睡前 / 工作间隙
- 已有「看深度内容」的预期
- 倾向收藏 + 转发到群，而非快速浏览

## Length & rhythm

- 主流爆款长度：**2000–4000 字**，少量精品 5000+。
- 段落短：**3–5 行手机视图**（≈ 80–150 字）。长段会被滑过。
- 每 300–500 字一个 `##` 小标题；超过 800 字无小标题，留存率掉一半。
- 引用 `>` 与列表混用，避免视觉单调。

## Hook（开头 ≤ 80 字）

公众号没有"标题党"的安全网——读者点开后 5 秒决定要不要读完。开头三种安全打法：

1. **反共识断言**："大多数人以为 X，但 X 其实不重要。"
2. **具体场景**："上周三我看到 ...，这事让我想到 ..."
3. **数字 / 对比**："过去 12 个月我做了 100 次 ..., 总结出 3 条规律。"

避免：
- "今天我们来聊聊..."（说教感）
- "关于 X 这个话题，相信大家都很关心..."（套话）
- 用问句开头 + 自答（被算法判低质）

## Body 结构

| 类型 | 适合主题 |
|------|----------|
| **总—分—总** | 观点类、读后感 |
| **问题—分析—解法** | 实用类、教程 |
| **时间线** | 事件复盘、产品史 |
| **对比** | A vs B、新老对比 |
| **清单** | "X 个 Y"——但每条要有内核，不能凑数 |

## Citation style

- 外链放底部 `## 参考链接`，因正文外链不可点击。
- 直接引用用 `>` 块，并标注来源（"——某书 P.32" / "——@某人 推文"）。
- 截图 / 图片要有 `图：xxx` 的图注。

## CTA（结尾）

- 公众号读者**反感**"求点赞 / 求转发"。
- 有效的结尾：
  - 一个具体问题（"你怎么看？欢迎留言"）
  - 一个延伸阅读（"如果你对 X 感兴趣，下篇我会写 Y"）
  - 一个自然的下一步（"附上工具清单，公众号回复 'Z' 获取"——已有矩阵的玩法）

## Don't

- ❌ 标题党（与正文不符 → 平台限流）
- ❌ "震惊！" "重磅！" "速看！" 等夸张词
- ❌ 大量加粗（每页 ≥ 5 处加粗显得焦虑）
- ❌ 通篇无小标题
- ❌ 无来源的"专家说" "研究表明"
- ❌ 段尾的"！！！" 多于 1 处
- ❌ 让读者去其他平台（"看完去 X 关注我" → 限流）

## Do

- ✅ 引用 + 私货（先客观陈述别人观点，再给自己判断）
- ✅ 具体例子 ≥ 抽象论述
- ✅ 自暴弱点（"我曾经也以为 ..."）建立信任
- ✅ 段尾留白：让上一段结论沉淀
````

- [ ] **Step 2: Commit**

```bash
git add skills/writeflow/references/wechat-style.md
git commit -m "feat(writeflow): add wechat style reference"
```

---

## Task 3: X style reference

**Files:**
- Create: `skills/writeflow/references/x-style.md`

- [ ] **Step 1: Write the reference**

Create `skills/writeflow/references/x-style.md`:

````markdown
# X (Twitter) Style Reference

Style notes for X threads (and X Articles when explicitly requested). These shape both outline structure and draft prose.

## Reader persona

X 是 **快速扫读** 的场景。读者：
- 在 timeline 上 0.5–2 秒决定要不要点开
- 看到长 thread 默认折叠，需要钩子诱使展开
- 移动端为主，单条最多 3 行视野

## Length discipline

- **单条 ≤ 270 字符**（留余给数字 1/N）
- 一条一意：不把两个论点塞进同一条
- 段间空行（X 折叠单换行，必须 `\n\n`）
- 主流 thread 长度：**5–15 条**；超过 15 条留存暴跌

## Hook（第一条）

第一条是整条 thread 的命门。三种高表现打法：

1. **反共识断言**：`Most devs think X. They're wrong.`
2. **具体数字 + 时间**：`I shipped 12 features in 90 days. Here's what I cut.`
3. **故事钩子**：`Last Tuesday a $40k bug hit prod. The fix was 3 lines.`

钩子必须**自包含**——脱离 thread 也读得懂。

## Algorithm signals (do)

- ✅ 第一条不带链接（带链接降权）
- ✅ 自然语言提问引发 reply（reply 是最强 ranking 信号）
- ✅ 整条 thread 内部互相引用（"see tweet 4"）
- ✅ 末条放原文链接 + 简短 CTA
- ✅ 中间穿插 1 张图 / 截图 / 代码（多模态 thread 留存高 30%）

## Algorithm signals (don't)

- ❌ 多个外链（链接 ≥ 2 → 降权明显）
- ❌ Hashtag ≥ 3（被分类 spam）
- ❌ 全大写 / 多个感叹号
- ❌ "Follow me for more!" 类机械 CTA
- ❌ `@mention` 大 V 求转发
- ❌ Reply guy 句式（"This."、"Underrated."）作为正文
- ❌ 引用未公开的 DM 截图

## Body 节奏

经典 thread 弧线：

```
1/  Hook (challenge / promise)
2/  Setup — what most people do / what conventional wisdom says
3/  Twist — why that's wrong / what you found
4/  Evidence #1 — concrete example / number
5/  Evidence #2 — second angle
6/  Edge case / counterargument acknowledged
7/  Practical takeaway — what reader does on Monday
8/  Recap (1 line) + link / CTA
```

不必八条，但二/三的"反转"是必需。

## Citation style

- 引用研究：先一句用自己的话总结结论，再 "(source: paper title, 2024)"
- 引用别人推文：截图 + handle，不光甩链接
- 数字必须有日期窗（"as of Q1 2025"）

## Length-by-content

| 类型 | 推荐条数 |
|------|----------|
| Hot take | 3–5 |
| Tutorial | 8–12 |
| Story / case study | 6–10 |
| Listicle (5 things) | 6–8 |
| Long-form analysis | 10–15 (or use X Article) |

## Don't

- ❌ "🧵👇" 单条（被算法降权，没必要标）
- ❌ 把每条结尾都加 emoji（视觉疲劳）
- ❌ "as I said in my previous thread..."（自引降权）
- ❌ 一连发 3 条 thread 同主题（被压制）

## Do

- ✅ 数字、对比、具体名字（具体性最稀缺）
- ✅ 承认反方论据后再反驳（说服力 > 单边输出）
- ✅ 让读者抄走的"一句话总结"
````

- [ ] **Step 2: Commit**

```bash
git add skills/writeflow/references/x-style.md
git commit -m "feat(writeflow): add x style reference"
```

---

## Task 4: WeChat outline procedure

**Files:**
- Create: `skills/writeflow/prompts/outline-wechat.md`

- [ ] **Step 1: Write the prompt**

Create `skills/writeflow/prompts/outline-wechat.md`:

````markdown
# Outline Procedure — WeChat 公众号

Run **before** drafting. The outline locks structure so the draft doesn't drift.

## Step 1 — Read all sources

Read every input file end to end. If a source is > 5000 字, summarize it in 5 bullets first, then continue.

## Step 2 — Extract candidate claims

List every distinct factual or opinion claim across the sources. Keep ≤ 25; group near-duplicates.

## Step 3 — Pick ONE core claim

The whole article will argue **exactly one** claim. Bias toward:
- Counter-intuitive (反共识)
- Concrete (with numbers, names, dates)
- Within author's authority (avoid "我猜世界局势会怎样")

If sources don't support a strong single claim, stop and tell the user: "sources too thin / too scattered, need <X>". Don't invent a claim.

## Step 4 — Identify the reader

Write **one sentence** answering: who is this for, what do they currently believe, and what will they walk away with? 越具体越好（"想转独立开发的厂里前端，目前以为 SaaS 已饱和"）。

## Step 5 — Steelman the counter-view

Write the strongest objection in one sentence. If you can't write a credible counter-view, the claim is too weak — go back to Step 3.

## Step 6 — Choose structure

Pick one from `references/wechat-style.md` "Body 结构" table. Justify in one sentence.

## Step 7 — Draft section list

Produce 4–8 sections (depending on `--length`):
- short → 4 sections, ~1500 字 target
- medium → 6 sections, ~2500 字 target
- long → 8 sections, ~4000 字 target

For each section, write:
- title (作为 `##` 小标题)
- 1–3 bullets (each pointing to a source quote/anchor)

## Step 8 — Hook + CTA

- Hook (第一段): one of the 3 patterns from `wechat-style.md`. Write it out, ≤ 80 字.
- CTA (last section): one concrete question / next-step.

## Step 9 — Source map

Below structure, list every claim ↔ source file/anchor. If a claim has no source, mark it `[opinion: author]` or remove.

## Step 10 — Emit outline.md

Use the schema in SKILL.md. Save to the user-specified path.

## Anti-patterns the outliner must avoid

- ❌ Generic 5-section template (intro / 3 points / conclusion) without justifying it
- ❌ Inventing facts not in sources
- ❌ Writing draft prose in the outline (bullets only)
- ❌ Multiple core claims ("we'll discuss A, B, and C" — pick one)
- ❌ Ignoring `--angle` if user provided it
````

- [ ] **Step 2: Commit**

```bash
git add skills/writeflow/prompts/outline-wechat.md
git commit -m "feat(writeflow): wechat outline procedure"
```

---

## Task 5: X thread outline procedure

**Files:**
- Create: `skills/writeflow/prompts/outline-x-thread.md`

- [ ] **Step 1: Write the prompt**

Create `skills/writeflow/prompts/outline-x-thread.md`:

````markdown
# Outline Procedure — X Thread

## Step 1 — Read all sources

Same as wechat, but bias toward **the most concrete** material — anecdotes, numbers, named entities. X thrives on specificity.

## Step 2 — Pick the single hook

X thread hangs from a single first-tweet hook. Before any structure, decide what it is. Use one of:
- 反共识断言
- 具体数字 + 时间
- 故事钩子

Write the hook tweet (≤ 270 chars) right now. If you can't write it cleanly, the angle isn't sharp enough.

## Step 3 — Identify reader

One sentence. Same rules as wechat. X readers are even more impatient — assume 1.5 seconds of attention.

## Step 4 — Counter-view

X thread without a "twist" reads flat. Write the strongest objection; the thread will acknowledge it before refuting.

## Step 5 — Pick thread arc

Use the canonical arc from `references/x-style.md`:
```
1 hook → 2 setup → 3 twist → 4-5 evidence → 6 edge case → 7 takeaway → 8 recap+CTA
```
Adjust length per the table in x-style.md.

## Step 6 — One-tweet-one-idea check

For each planned tweet, write its **one idea** in ≤ 30 字. If two ideas don't fit one tweet, split. If one idea doesn't fill one tweet, merge.

## Step 7 — Source map

For every concrete claim (number / name / quote), write the source. If you can't find a source, either remove it or mark as `[opinion]`. Threads with un-sourced numbers get ratio'd.

## Step 8 — CTA

Last tweet: pick one of:
- Link to original article ("Full post 👇")
- Question to elicit reply ("What did I miss?")
- Concrete next step ("Code: github.com/...")

Avoid "Follow me for more".

## Step 9 — Emit outline.md

Use the same schema as wechat (SKILL.md). The "Structure" section is the numbered tweet list with one-line ideas.

## Anti-patterns

- ❌ "🧵 1/12" as part of structure (numbering is added by `markdown-to-thread`)
- ❌ Hook that requires reading tweet 2 to understand
- ❌ Two arguments per tweet
- ❌ Filler tweets ("More on this below 👇")
- ❌ Ending on the link without a one-line takeaway above it
````

- [ ] **Step 2: Commit**

```bash
git add skills/writeflow/prompts/outline-x-thread.md
git commit -m "feat(writeflow): x thread outline procedure"
```

---

## Task 6: WeChat draft procedure

**Files:**
- Create: `skills/writeflow/prompts/draft-wechat.md`

- [ ] **Step 1: Write the prompt**

Create `skills/writeflow/prompts/draft-wechat.md`:

````markdown
# Draft Procedure — WeChat 公众号

Input: an outline produced by `outline-wechat.md`. Output: publish-ready markdown.

## Step 0 — Sanity check the outline

Verify the outline has Reader, Core claim, Counter-view. If any are missing, refuse and ask the user to re-run `outline`.

## Step 1 — Title

Write 3 candidate titles. Each must:
- 不党标题党（与正文相符）
- ≤ 25 字
- 具体（含数字 / 名字 / 反共识词）

Pick one. Put it as `# H1`.

## Step 2 — Hook (开头段)

Use the outline's hook. Tighten to ≤ 80 字. **Do not** add "今天我们来聊聊...". After the hook, one transition sentence into the body.

## Step 3 — Body

For each section in the outline:

1. Write a `## 小标题`. Avoid generic titles like "背景"、"分析"、"总结"; mirror the section's actual point.
2. Expand bullets into prose. Rules:
   - 段落 ≤ 5 行（移动视图）
   - 一个段落 = 一个想法
   - 引用别人观点用 `>` 引用块 + 来源
   - 数字必须配年份 / 出处
3. Acknowledge the counter-view in **one paragraph** somewhere in the body (typically section 3 or 4).
4. Use lists when 3+ items, prose otherwise.

## Step 4 — Closing & CTA

- One paragraph synthesizing the core claim (no "总而言之").
- One line CTA from outline.

## Step 5 — 参考链接 section

If the outline's source map contains URLs, append:

```markdown
## 参考链接

1. [标题](url)
2. ...
```

公众号正文外链不可点击 → 这是必要的底部引用。

## Step 6 — Final pass

Re-read the draft once. Cut for:
- Repeated points (each idea once)
- "其实" / "事实上" / "可以说" 等填充词
- 段尾的"!"
- 通用比喻（"就像...一样"）

## Step 7 — Emit draft.md

Save to user-specified path.

## Anti-patterns

- ❌ 加 H1 之外再加副标题
- ❌ 段落 > 5 行手机视图
- ❌ "我们" 主语滥用
- ❌ 无小标题的 800+ 字段
- ❌ 把外链嵌在正文中（除非 mp.weixin.qq.com 站内）
- ❌ 未在 outline 中出现的"专家说" / 研究数据
````

- [ ] **Step 2: Commit**

```bash
git add skills/writeflow/prompts/draft-wechat.md
git commit -m "feat(writeflow): wechat draft procedure"
```

---

## Task 7: X thread draft procedure

**Files:**
- Create: `skills/writeflow/prompts/draft-x-thread.md`

- [ ] **Step 1: Write the prompt**

Create `skills/writeflow/prompts/draft-x-thread.md`:

````markdown
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
````

- [ ] **Step 2: Commit**

```bash
git add skills/writeflow/prompts/draft-x-thread.md
git commit -m "feat(writeflow): x thread draft procedure"
```

---

## Task 8: Marketplace registration

**Files:**
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Add `./skills/writeflow` keeping alphabetical order**

It should sit between `./skills/url-to-markdown` and `./skills/xhs-images`:

```json
        "./skills/url-to-markdown",
        "./skills/writeflow",
        "./skills/xhs-images",
```

- [ ] **Step 2: Verify JSON parses**

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8'))" && echo OK
```

- [ ] **Step 3: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "feat(writeflow): register skill in marketplace"
```

---

## Task 9: Smoke verification

**Files:**
- (read-only)

- [ ] **Step 1: Layout check**

```bash
ls skills/writeflow/
ls skills/writeflow/prompts/
ls skills/writeflow/references/
```

Expected:
```
SKILL.md  prompts  references
draft-wechat.md  draft-x-thread.md  outline-wechat.md  outline-x-thread.md
wechat-style.md  x-style.md
```

- [ ] **Step 2: Cross-link sanity**

```bash
grep -cE "prompts/outline-wechat|prompts/outline-x-thread|prompts/draft-wechat|prompts/draft-x-thread|references/wechat-style|references/x-style" skills/writeflow/SKILL.md
```

Expected: ≥ 6.

- [ ] **Step 3: Trigger phrase coverage**

```bash
grep -E "写大纲|拟提纲|写初稿|写文章|draft an article|outline an article|write a thread" skills/writeflow/SKILL.md
```

Expected: present in description.

- [ ] **Step 4: Pipeline composition note**

```bash
grep -E "url-to-markdown|youtube-transcript|content-review|markdown-to-thread|post-to-wechat|post-to-x" skills/writeflow/SKILL.md
```

Expected: ≥ 5 hits — proves the skill names its upstream and downstream neighbors.

- [ ] **Step 5: No commit**

This task is verification only.

---

## Self-Review Notes

- **Spec coverage:** scaffold (T1) + 2 references (T2, T3) + 4 prompts — outline×2 + draft×2 (T4–T7) + registration (T8) + smoke (T9). Both stages × both platforms covered. The skill explicitly chains with `url-to-markdown`/`youtube-transcript` upstream and `content-review`/`markdown-to-thread`/`post-to-*` downstream — closing the "想/写" gap from the parent improvement plan.
- **Placeholder scan:** No "TBD" / "fill in later". Every prompt has numbered steps with concrete acceptance criteria. Every reference lists explicit do/don't items.
- **Type consistency:** No code, so no type drift. Outline schema (Reader / Core claim / Counter-view / Structure / Source map) defined once in SKILL.md and enforced identically in all 4 prompts. Section headings (`## Hook`, `## Body`, etc.) use stable wording across files.
- **Risks:**
  - Style references will date. Acceptable for v0.1.0; downstream `EXTEND.md` override (project-level) is the future escape hatch but not in this plan.
  - The skill assumes the user has already collected sources. Documented in SKILL.md "What writeflow does NOT do".
