# Writeflow 输出格式规范

> 本文档基于 writeflow skill 的 `references/xhs-to-images-handover.md` 精简，只保留 xhs-images 需要了解的输出格式约定。完整信息请参考 writeflow skill 的官方文档。

---

## 1. 概述

writeflow 是上游 skill，负责将原始素材转化为平台化的大纲和草稿。当用户使用 writeflow 完成小红书草稿后，会输出结构化的 image content spec，xhs-images 负责将其转化为实际的图片生成。

---

## 2. Writeflow 输出格式（Image Content Spec）

writeflow 在 `draft-xhs` 阶段输出的图片内容规范，采用 YAML 格式，每张图一个独立条目。

### 2.1 完整 Schema

```yaml
# 单张图片的 content spec
image:
  # 图片在系列中的位置（决定布局策略）
  position: cover     # cover | setup | core | payoff | ending

  # 文本内容
  title: "..."        # 主标题（大字，必填）
  subtitle: "..."     # 副标题（小字，可选）
  points:             # 要点列表（1-4 条，封面可为空）
    - "要点 1"
    - "要点 2"

  # 视觉描述
  visual_description: "..."  # 视觉概念/画面描述（用于 AI 绘图）

  # 风格与布局
  style: bold         # 风格预设名
  layout: sparse      # 布局预设名

  # 可选增强字段
  slug: "..."         # 简短标识（用于文件名，kebab-case）
  swipe_hook: "..."   # 左滑钩子（引导用户看下一张）
  cta: "..."          # 行动号召（仅 ending 位置用）
```

### 2.2 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `position` | string | 是 | 图片位置：`cover` / `setup` / `core` / `payoff` / `ending` |
| `title` | string | 是 | 主标题，封面 ≤15 字，内页 ≤12 字 |
| `subtitle` | string | 否 | 副标题，补充说明，≤20 字 |
| `points` | string[] | 否 | 要点列表，每页 1-4 条，封面可省略 |
| `visual_description` | string | 是 | 视觉概念描述，1-2 句话，指导 AI 绘图 |
| `style` | string | 是 | 风格名称 |
| `layout` | string | 是 | 布局名称 |
| `slug` | string | 否 | 简短标识，用于生成文件名 |
| `swipe_hook` | string | 否 | 左滑引导语（结尾页不用） |
| `cta` | string | 否 | 行动号召（仅 ending 页用） |

### 2.3 多图集合输出

完整的小红书内容方案包含 2-9 张图，用数组组织：

```yaml
images:
  - position: cover
    title: "..."
    ...
  - position: ending
    title: "..."
    ...
```

---

## 3. 字段映射关系

### 3.1 Position 映射

writeflow 使用 5 种位置，xhs-images 内部使用 3 种分类：

| writeflow `position` | xhs-images `Position` | 说明 |
|----------------------|-----------------------|------|
| `cover` | `Cover` | 封面图，停止滑动 |
| `setup` | `Content` | 铺垫/建立共鸣 |
| `core` | `Content` | 核心价值交付 |
| `payoff` | `Content` | 收获/行动清单 |
| `ending` | `Ending` | 结尾/CTA/互动 |

### 3.2 字段名映射

| writeflow 字段 | xhs-images 字段 | 说明 |
|-----------------|-----------------|------|
| `position` | `Position` | 首字母大写，5→3 分类映射 |
| `title` | `Title` | 主标题，加「」引号 |
| `subtitle` | `Subtitle` | 副标题 |
| `points` | `Points` | 要点列表 |
| `visual_description` | `Visual Concept` | 视觉描述 |
| `style` | `style` (frontmatter) | 全局风格，取第一张 |
| `layout` | `Layout` | 单张布局 |
| `slug` | `Slug` / `Filename` | 用于生成文件名 |
| `swipe_hook` | `Swipe Hook` | 左滑引导 |
| `cta` | CTA 放入 Points | 结尾页行动号召 |

---

## 4. 自动选择策略

如果 writeflow 输出中未指定 `style` 或 `layout`（不推荐，但可能发生），xhs-images 按以下策略自动选择：

### 4.1 Style 自动选择

| 内容特征 | 推荐 style |
|----------|------------|
| 干货/知识/工具 | `notion` |
| 教程/步骤/学习 | `chalkboard` 或 `study-notes` |
| 种草/好物/生活 | `cute` 或 `fresh` |
| 避坑/警示/对比 | `bold` |
| 故事/情感/个人 | `warm` |
| 数据/报告/专业 | `minimal` |

### 4.2 Layout 自动选择

| position | 要点数 | 推荐 layout |
|----------|--------|-------------|
| cover | 0-1 | `sparse` |
| setup | 2-3 | `balanced` |
| core | 3-5 | `balanced` / `list` |
| core | 5+ | `dense` |
| payoff | 3-4 | `list` / `balanced` |
| ending | 1-2 | `sparse` |

---

## 5. 文件名生成规则

```
NN-{type}-{slug}.png
```

- `NN`: 两位序号（从 01 开始）
- `type`: cover / content / ending（从 position 映射）
- `slug`: 简短标识（kebab-case）

**示例**：
- 第 1 张 cover → `01-cover-interview-myth.png`
- 第 2 张 setup → `02-content-what-you-think.png`
- 第 5 张 ending → `05-ending-summary.png`

---

## 6. 约束校验

xhs-images 接入 writeflow 输出时应校验：

| 约束项 | 要求 |
|--------|------|
| 图片数量 | 2 ≤ N ≤ 9 |
| 封面 | 有且仅有 1 张 `position: cover` |
| `position` | 必须 ∈ {cover, setup, core, payoff, ending} |
| `title` | 必填 |
| `visual_description` | 必填 |
| `style` | 在可用列表内 |
| `layout` | 在可用列表内 |

> 注：完整的处理流程、prompt 组装和生成步骤，请参考 xhs-images 内部文档。
