# Outline Procedure — Xiaohongshu 小红书

Run **before** drafting. The outline locks structure so the caption + image series don't drift.

## Step 1 — Read sources & mining output

Read the source material (1v1 纪要, sc-content-mining output, etc.) end to end. If a source is > 3000 字, extract 5 key bullets first.

## Step 2 — Confirm core claim

The whole note argues **exactly one** claim. If sc-content-mining output exists, use its recommended claim. Otherwise:

- Bias toward **认知颠覆** (counter-intuitive)
- Must be **concrete** (with real examples from 纪要)
- Must fit in **one cover image** (≤ 15 字)

If sources don't support a strong single claim, stop and tell the user.

## Step 3 — Identify the reader

Write **one sentence**: who is this for, what do they currently believe, what will they gain?

### 示例 1：求职/前端

"正在求职的 3-5 年经验前端，以为技术好就能进大厂，看完会知道面试官其实在赌潜力"

### 示例 2：职场/产品经理

"工作 2-3 年的产品经理，以为需求写得越细越好，看完会知道对齐预期比文档厚度更重要"

### 示例 3：副业/自由职业

"刚开始做自由职业的设计师，以为接活越多赚得越多，看完会知道筛选客户比盲目接单更重要"

## Step 4 — Design cover hook

Cover image = 90% of XHS traffic. Write:
- **主标题** (≤ 15 字, for cover image): 反认知 / 数字冲击 / 身份共鸣
- **副标题** (≤ 20 字, optional): 补充说明
- **visual_description**: 一句话描述封面视觉（如"入场券燃烧+门后光"）

## Step 5 — Plan image series (2-9 张)

Each image = ONE key point. Plan the swipe flow:

| 位置 | 用途 | 内容 |
|------|------|------|
| 封面 | 停止滑动 | 主标题+视觉冲击 |
| 铺垫 | 建立共鸣 | 痛点场景 / 你以为的 |
| 核心 | 交付价值 | 真相 / 颠覆认知 |
| 收获 | 可执行 | 行动清单 / 方法论 |
| 结尾 | 驱动互动 | 互动引导 / CTA |

For each image, write:
- 标题 (图片大字)
- 要点 (1-2 个核心信息)
- visual_description (视觉描述，简述)

## Step 6 — Write caption (正文)

Caption = 200-500 字, 补充图片无法承载的细节:
- Hook (≤ 50 字): 痛点切入
- 核心内容: 图片要点的文字补充 + 真实案例
- CTA: 互动引导 ("左滑看全部→" / "评论区说说你的经历")

## Step 7 — Tags

- 3-5 个 `#话题`
- 1 个大流量标签 + 1-2 个精准标签 + 1 个内容类型标签

## Step 8 — Emit outline

```yaml
title: "..."
cover:
  main: "..."              # 主标题
  sub: "..."               # 副标题
  visual_description: "..."  # 视觉描述
images:
  - position: cover
    title: "..."
    points: [...]
    visual_description: "..."
  - position: setup
    ...
caption: |
  ...
tags: [...]
```

## Anti-patterns

- ❌ 封面标题超过 15 字
- ❌ 单张图塞超过 2 个要点
- ❌ 正文超过 500 字
- ❌ 标签超过 5 个
- ❌ 正文与图片内容完全重复
- ❌ 没有左滑引导
