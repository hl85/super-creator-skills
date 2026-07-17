# XHS-Images 输入格式规范

> 本文档基于 sc-xhs-images skill 的 `references/workflows/writeflow-input.md` 精简，只保留 sc-writeflow 需要了解的输入格式约定。完整信息请参考 sc-xhs-images skill 的官方文档。

---

## 1. 概述

sc-xhs-images 是下游 skill，负责将 sc-writeflow 输出的图片内容规范（image content spec）转化为实际的小红书信息图系列。

sc-writeflow 在 `draft-xhs` 阶段输出的 image spec，是 sc-xhs-images 的输入来源。

---

## 2. Writeflow 输出格式（即 XHS-Images 输入）

### 2.1 Image Spec Schema

sc-writeflow 输出的单张图片规范（YAML 格式）：

```yaml
image:
  position: cover     # cover | setup | core | payoff | ending
  title: "..."        # 主标题（必填）
  subtitle: "..."      # 副标题（可选）
  points:              # 要点列表（可选）
    - "要点 1"
    - "要点 2"
  visual_description: "..."  # 视觉描述（必填，用于 AI 绘图）
  style: bold          # 风格预设（必填）
  layout: sparse      # 布局预设（必填）
  slug: "..."         # 可选，文件名标识
  swipe_hook: "..."   # 可选，左滑引导
  cta: "..."           # 可选，行动号召（仅 ending）
```

### 2.2 多图集合

完整的小红书内容方案包含 2-9 张图，用 `images` 数组组织：

```yaml
images:
  - position: cover
    title: "..."
    ...
  - position: core
    title: "..."
    ...
  - position: ending
    title: "..."
    ...
```

---

## 3. 可用 Style / Layout 列表

### 3.1 Style 列表

| Style | 说明 |
|-------|------|
| `cute` | 甜美可爱风 |
| `fresh` | 清新自然风 |
| `notion` | 极简线条风 |
| `chalkboard` | 粉笔黑板风 |
| `study-notes` | 手写笔记风 |
| `bold` | 粗体醒目风 |
| `minimal` | 极简约素风 |
| `warm` | 温暖治愈风 |
| `retro` | 复古怀旧风 |
| `pop` | 波普艺术风 |
| `screen-print` | 丝网印刷风 |

### 3.2 Layout 列表

| Layout | 信息密度 | 适用场景 |
|--------|----------|----------|
| `sparse` | 1-2 点 | 封面、金句、CTA |
| `balanced` | 3-4 点 | 标准内容页 |
| `dense` | 5-8 点 | 知识卡片、清单 |
| `list` | 纵向列表 | 排名、清单、步骤 |
| `comparison` | 左右对比 | 利弊、前后、对比 |
| `flow` | 流程箭头 | 步骤、时间线 |
| `mindmap` | 思维导图 | 概念、结构 |
| `quadrant` | 四象限 | 矩阵分析 |

---

## 4. Position 与布局建议

| position | 要点数 | 推荐 layout |
|----------|--------|-------------|
| cover | 0-1 | `sparse` |
| setup | 2-3 | `balanced` |
| core | 3-5 | `balanced` / `list` |
| core | 5+ | `dense` |
| payoff | 3-4 | `list` / `balanced` |
| ending | 1-2 | `sparse` |

---

## 5. 约束与校验规则

sc-xhs-images 对接入的 image spec 有以下校验要求，sc-writeflow 输出时应满足：

| 约束项 | 要求 |
|--------|------|
| 图片数量 | 2 ≤ N ≤ 9 |
| 封面 | 有且仅有 1 张 `position: cover` |
| `position` | 必须 ∈ {cover, setup, core, payoff, ending} |
| `title` | 必填，封面 ≤15 字，内页 ≤12 字 |
| `visual_description` | 必填，1-2 句话 |
| `style` | 必须在可用列表中 |
| `layout` | 必须在可用列表中 |

---

## 6. 下游调用方式

sc-writeflow 输出 image spec 后，转换为 sc-xhs-images 的 outline 格式，再调用：

```bash
./sc-run sc-xhs-images main outline.md --yes
```

> 注：具体的 outline 格式、转换逻辑和生成流程，请参考 sc-xhs-images skill 的官方文档。
