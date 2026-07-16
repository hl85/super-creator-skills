# 从 Writeflow 输入处理指南

本文档说明 xhs-images 如何接收和处理来自 writeflow skill 的图片内容规范（image content spec）。

---

## 1. 概述

writeflow 是内容创作的上游 skill，负责将原始素材 → 平台化的大纲和草稿。当用户使用 writeflow 完成小红书草稿后，会输出结构化的 image content spec，xhs-images 负责将其转化为实际的图片生成。

### 1.1 输入来源

writeflow 在 `draft-xhs` 阶段输出的内容结构：

```
writeflow draft-xhs 输出
├── 标题
├── 正文 (caption)
├── 标签
└── 信息图分页内容 (images 数组)
    └── 每张图的 YAML spec
```

---

## 2. Writeflow 输出格式解析

### 2.1 Writeflow Image Spec Schema

writeflow 输出的单张图片规范：

```yaml
image:
  position: cover     # cover | setup | core | payoff | ending
  title: "..."        # 主标题
  subtitle: "..."      # 副标题（可选）
  points:              # 要点列表（可选）
    - "要点 1"
    - "要点 2"
  visual_description: "..."  # 视觉描述
  style: bold          # 风格
  layout: sparse      # 布局
  slug: "..."         # 可选，文件名标识
  swipe_hook: "..."   # 可选，左滑引导
  cta: "..."           # 可选，行动号召（仅 ending）
```

### 2.2 完整示例输入

完整的输入可能以 YAML 数组形式提供：

```yaml
images:
  - position: cover
    title: "面试其实不是考技术"
    subtitle: "90%的人都搞错了"
    points: []
    visual_description: "一张燃烧的简历，背景是面试房间门透出的光"
    style: bold
    layout: sparse
    slug: "interview-myth"
    swipe_hook: "左滑看真相→"
    
  - position: setup
    title: "你以为的面试"
    points:
      - "算法题刷够就行"
      - "技术栈问倒面试官"
    visual_description: "左边是埋头刷题的人，头上是代码符号"
    style: bold
    layout: balanced
    slug: "what-you-think"
    swipe_hook: "但实际呢？"
    
  - position: core
    title: "面试官在赌什么"
    points:
      - "你的潜力，不是现在的能力"
      - "学习速度 > 当前技术深度"
    visual_description: "面试官视角，候选人头顶有成长曲线向上的光柱"
    style: bold
    layout: balanced
    slug: "what-interviewer-bets"
    swipe_hook: "那怎么证明？"
    
  - position: payoff
    title: "3个证明潜力的方法"
    points:
      - "讲成长故事：从不会到会"
      - "show 学习笔记/作品"
      - "问有深度的问题"
    visual_description: "三个台阶，每级站一个小人"
    style: bold
    layout: list
    slug: "3-ways"
    swipe_hook: "最后总结"
    
  - position: ending
    title: "技术是入场券"
    subtitle: "潜力才是通行证"
    points: []
    visual_description: "一张门票，背后是大门打开的光"
    style: bold
    layout: sparse
    slug: "summary"
    cta: "收藏备用 | @你正在面试的朋友"
```

---

## 3. 字段映射与转换

### 3.1 Position 映射

writeflow 使用 5 种细粒度位置，xhs-images 内部使用 3 种分类：

| writeflow `position` | xhs-images `Position` | 文件名类型 |
|----------------------|-----------------------|-----------|
| `cover` | `Cover` | `cover` |
| `setup` | `Content` | `content` |
| `core` | `Content` | `content` |
| `payoff` | `Content` | `content` |
| `ending` | `Ending` | `ending` |

### 3.2 字段名映射表

| writeflow 字段 | xhs-images 字段 | 转换规则 |
|-----------------|-----------------|----------|
| `position` | `Position` | 5→3 映射，首字母大写 |
| `title` | `Title` | 加「」引号包裹 |
| `subtitle` | `Subtitle` | 直接映射 |
| `points` | `Points` | 直接映射（数组） |
| `visual_description` | `Visual Concept` | 直接映射（字段重命名 |
| `style` | `style` (frontmatter) | 取第一张的 style 作为全局风格 |
| `layout` | `Layout` | 直接映射（单张级别） |
| `slug` | `Slug` | 直接映射，无则从 title 生成 |
| `swipe_hook` | `Swipe Hook` | 直接映射，无则自动生成 |
| `cta` | Points 中的 CTA 项 | 仅 ending 位置，加入 points |

### 3.3 文件名生成规则

```
NN-{type}-{slug}.png
```

- `NN`: 两位序号（从 01 开始
- `type`: cover / content / ending（从 position 映射）
- `slug`: 简短标识（kebab-case）

**示例**：
- 第 1 张 cover → `01-cover-interview-myth.png`
- 第 2 张 setup → `02-content-what-you-think.png`
- 第 5 张 ending → `05-ending-summary.png`

---

## 4. 风格/布局自动选择策略

当 writeflow 输出中缺少 `style` 或 `layout` 时（不推荐但可能发生），按以下策略自动补全。

### 4.1 Style 自动选择

基于内容特征和 position 推断：

| 内容关键词 | 推荐 style | 理由 |
|-----------|------------|------|
| 干货/知识/技巧/方法 | `notion` | 知识卡片风格，适合信息传递 |
| 教程/步骤/学习/笔记 | `chalkboard` | 教育感强，适合学习类 |
| 避坑/警示/对比/真相 | `bold` | 视觉冲击力强 |
| 故事/经历/个人/成长 | `warm` | 温暖治愈，情感共鸣 |
| 种草/好物/生活/美妆 | `cute` 或 `fresh` | 甜美清新，适合生活类 |
| 数据/报告/专业/职场 | `minimal` | 简约专业，信任感强 |

**判断优先级**：
1. 如果 writeflow 指定了 style → 直接使用
2. 如果内容中有明显关键词 → 按上表匹配
3. 默认 fallback → `notion`（最通用）

### 4.2 Layout 自动选择

基于 position 和要点数量：

| position | 要点数 | 推荐 layout |
|----------|--------|-------------|
| cover | 0-1 | `sparse` |
| setup | 2-3 | `balanced` |
| core | 2-3 | `balanced` |
| core | 4-5 | `dense` |
| core | 步骤类内容 | `list` 或 `flow` |
| core | 对比类内容 | `comparison` |
| payoff | 清单/步骤 | `list` |
| payoff | 3-4 点 | `balanced` |
| ending | 1-2 点 | `sparse` |

---

## 5. 批量生成执行步骤

### 5.1 处理流程

```
Writeflow Image Spec 输入
        │
        ▼
  解析 YAML 解析
        │
        ├─► 提取 images 数组
        ├─► 校验必填字段
        └─► 确认图片数量 (2-9)
        │
        ▼
  转换为 Outline 格式
        │
        ├─► 生成 frontmatter
        │    ├─ style: 取首图 style (或自动选择)
        │    ├─ default_layout: balanced
        │    ├─ image_count: 图片数量
        │    └─ strategy: writeflow-import
        │
        ├─► 逐张转换
        │    ├─ position 映射
        │    ├─ 生成 slug/filename
        │    ├─ 补全 swipe_hook
        │    └─ 字段名转换
        │    └─ 视觉描述映射
        │
        ▼
  写入 outline.md
        │
        ▼
  执行图片生成
        │
        ├─► 加载 style preset
        ├─► 加载 layout 配置
        ├─► 逐张组装 prompt
        ├─► 第 1 张无参考图生成
        └─► 第 2+ 张用第 1 张作参考
        │
        ▼
  输出图片文件
```

### 5.2 详细步骤

**Step 1: 接收并解析输入**

从 writeflow 输出中提取 `images` 数组：

- 输入可以是 YAML 格式的 images 数组
- 或包含 images 字段的 Markdown 文件
- 或单独的 YAML 文件

**Step 2: 字段校验**

校验每张图的必填字段：

| 字段 | 要求 |
|------|------|
| `position` | 必须 ∈ {cover, setup, core, payoff, ending} |
| `title` | 必填 |
| `visual_description` | 必填 |
| `style` | 可选，缺省自动选择 |
| `layout` | 可选，缺省自动选择 |

校验整体约束：
- 有且仅有 1 张 `position: cover`
- 图片数量 2 ≤ N ≤ 9
- style 值在可用列表中
- layout 值在可用列表中

**Step 3: 转换为 xhs-images outline 格式**

生成标准的 outline.md 文件，格式参见 [outline-template.md](outline-template.md)。

**Step 4: 执行生成**

调用图片生成流程：
1. 加载 style preset（从 `references/presets/{style}.md`）
2. 加载 layout 配置（从 `references/elements/canvas.md`）
3. 按 [prompt-assembly.md](prompt-assembly.md) 组装每张图的 prompt
4. 第 1 张（cover）无参考图生成
5. 第 2+ 张用第 1 张作为风格参考
6. 输出生成的图片文件

---

## 6. 端到端完整示例

### 6.1 Writeflow 输出示例

```yaml
images:
  - position: cover
    title: "面试其实不是考技术"
    subtitle: "90%的人都搞错了"
    points: []
    visual_description: "一张燃烧的简历，背景是面试房间门透出的光，戏剧化对比"
    style: bold
    layout: sparse
    slug: "interview-myth"
    swipe_hook: "左滑看真相→"

  - position: setup
    title: "你以为的面试"
    points:
      - "算法题刷够就行"
      - "技术栈问倒面试官"
    visual_description: "左边是埋头刷题的卡通小人，头上飞满代码符号，一脸自信"
    style: bold
    layout: balanced
    slug: "what-you-think"
    swipe_hook: "但实际呢？"

  - position: core
    title: "面试官在赌什么"
    points:
      - "你的潜力，不是现在的能力"
      - "学习速度 > 当前技术深度"
    visual_description: "面试官视角，候选人头顶有成长曲线向上的光柱，亮眼"
    style: bold
    layout: balanced
    slug: "what-interviewer-bets"
    swipe_hook: "那怎么证明？"

  - position: payoff
    title: "3个证明潜力的方法"
    points:
      - "讲成长故事：从不会到会的经历"
      - "show 学习笔记/个人作品"
      - "问有深度的思考问题"
    visual_description: "三个向上的台阶，每级站一个卡通小人，逐级向上"
    style: bold
    layout: list
    slug: "3-ways-to-prove"
    swipe_hook: "最后总结一下"

  - position: ending
    title: "技术是入场券"
    subtitle: "潜力才是通行证"
    points: []
    visual_description: "一张入场券，背景是大门打开透出的光，希望感"
    style: bold
    layout: sparse
    slug: "summary"
    cta: "收藏备用 | @你正在面试的朋友"
```

### 6.2 XHS-Images 转换后的 Outline

```markdown
# Xiaohongshu Infographic Series Outline

---
strategy: writeflow-import
name: Writeflow Import
style: bold
default_layout: balanced
image_count: 5
generated: 2026-07-16 10:30
---

## Image 1 of 5

**Position**: Cover
**Layout**: sparse
**Hook**: 90%的人都搞错了
**Slug**: interview-myth
**Filename**: 01-cover-interview-myth.png

**Text Content**:
- Title: 「面试其实不是考技术」
- Subtitle: 90%的人都搞错了

**Visual Concept**:
一张燃烧的简历，背景是面试房间门透出的光，戏剧化对比

**Swipe Hook**: 左滑看真相→

---

## Image 2 of 5

**Position**: Content
**Layout**: balanced
**Core Message**: 你以为的面试
**Slug**: what-you-think
**Filename**: 02-content-what-you-think.png

**Text Content**:
- Title: 「你以为的面试」
- Points:
  - 算法题刷够就行
  - 技术栈问倒面试官

**Visual Concept**:
左边是埋头刷题的卡通小人，头上飞满代码符号，一脸自信

**Swipe Hook**: 但实际呢？

---

## Image 3 of 5

**Position**: Content
**Layout**: balanced
**Core Message**: 面试官在赌什么
**Slug**: what-interviewer-bets
**Filename**: 03-content-what-interviewer-bets.png

**Text Content**:
- Title: 「面试官在赌什么」
- Points:
  - 你的潜力，不是现在的能力
  - 学习速度 > 当前技术深度

**Visual Concept**:
面试官视角，候选人头顶有成长曲线向上的光柱，亮眼

**Swipe Hook**: 那怎么证明？

---

## Image 4 of 5

**Position**: Content
**Layout**: list
**Core Message**: 3个证明潜力的方法
**Slug**: 3-ways-to-prove
**Filename**: 04-content-3-ways-to-prove.png

**Text Content**:
- Title: 「3个证明潜力的方法」
- Points:
  - 讲成长故事：从不会到会的经历
  - show 学习笔记/个人作品
  - 问有深度的思考问题

**Visual Concept**:
三个向上的台阶，每级站一个卡通小人，逐级向上

**Swipe Hook**: 最后总结一下

---

## Image 5 of 5

**Position**: Ending
**Layout**: sparse
**Core Message**: 技术是入场券，潜力才是通行证
**Slug**: summary
**Filename**: 05-ending-summary.png

**Text Content**:
- Title: 「技术是入场券」
- Subtitle: 潜力才是通行证
- CTA: 收藏备用 | @你正在面试的朋友

**Visual Concept**:
一张入场券，背景是大门打开透出的光，希望感

---
```

### 6.3 最终生成的图片文件

生成的图片存放于工作目录，命名如下：

```
01-cover-interview-myth.png       # 封面
02-content-what-you-think.png      # 铺垫
03-content-what-interviewer-bets.png # 核心
04-content-3-ways-to-prove.png  # 收获
05-ending-summary.png            # 结尾
```

配合 writeflow 输出的正文和标签，即可发布到小红书。

---

## 7. 相关文档

- [outline-template.md](outline-template.md) - Outline 模板格式
- [prompt-assembly.md](prompt-assembly.md) - Prompt 组装指南
- [analysis-framework.md](analysis-framework.md) - 内容分析框架
- ../../writeflow/references/xhs-to-images-handover.md - Writeflow 衔接手册
