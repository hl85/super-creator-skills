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
