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
