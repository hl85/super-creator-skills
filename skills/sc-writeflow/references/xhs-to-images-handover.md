# Writeflow → XHS-Images 衔接手册

本文档定义 sc-writeflow 的小红书草稿输出与 sc-xhs-images skill 之间的标准交接规范。

---

## 1. Writeflow 输出格式（Image Content Spec）

sc-writeflow 在 `draft-xhs` 阶段输出的图片内容规范，采用 YAML 格式，每张图一个独立条目。

### 1.1 完整 Schema

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
  style: bold         # 风格预设名（见下方可用列表）
  layout: sparse      # 布局预设名（见下方可用列表）
  
  # 可选增强字段
  slug: "..."         # 简短标识（用于文件名，kebab-case）
  swipe_hook: "..."   # 左滑钩子（引导用户看下一张）
  cta: "..."          # 行动号召（仅 ending 位置用）
```

### 1.2 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `position` | string | ✅ | 图片位置：`cover` / `setup` / `core` / `payoff` / `ending` |
| `title` | string | ✅ | 主标题，封面 ≤15 字，内页 ≤12 字 |
| `subtitle` | string | ❌ | 副标题，补充说明，≤20 字 |
| `points` | string[] | ❌ | 要点列表，每页 1-4 条，封面可省略 |
| `visual_description` | string | ✅ | 视觉概念描述，1-2 句话，指导 AI 绘图 |
| `style` | string | ✅ | 风格名称，见 §3 可用列表 |
| `layout` | string | ✅ | 布局名称，见 §3 可用列表 |
| `slug` | string | ❌ | 简短标识，用于生成文件名 |
| `swipe_hook` | string | ❌ | 左滑引导语（结尾页不用） |
| `cta` | string | ❌ | 行动号召（仅 ending 页用） |

### 1.3 多图集合输出

完整的小红书内容方案包含 2-9 张图，用数组组织：

```yaml
images:
  - position: cover
    title: "..."
    ...
  - position: setup
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

## 2. XHS-Images 输入格式要求

sc-xhs-images skill 接收以下几种输入形式：

### 2.1 支持的输入方式

| 输入方式 | 说明 | 适用场景 |
|----------|------|----------|
| Markdown 文章 | 自动分析内容并生成图片系列 | 长文转图 |
| Outline 文件 | 预先生成的 outline（推荐） | sc-writeflow 交接 |
| 命令行参数 | `--style` / `--layout` / `--preset` | 快速生成 |

### 2.2 推荐交接方式：Outline 文件

sc-writeflow 输出的 image spec 需要转换为 sc-xhs-images 的 outline 格式后再调用。

sc-xhs-images outline 格式（见 `sc-xhs-images/references/workflows/outline-template.md`）：

```markdown
# Xiaohongshu Infographic Series Outline

---
strategy: custom
name: Writeflow Import
style: notion
default_layout: balanced
image_count: 6
generated: YYYY-MM-DD HH:mm
---

## Image 1 of 6

**Position**: Cover
**Layout**: sparse
**Hook**: ...
**Slug**: ...
**Filename**: 01-cover-....png

**Text Content**:
- Title: 「...」
- Subtitle: ...
- Points:
  - ...
  - ...

**Visual Concept**:
...

**Swipe Hook**: ...
```

---

## 3. 字段映射关系

### 3.1 Position 映射

sc-writeflow 使用 5 种位置，sc-xhs-images 内部使用 3 种分类：

| sc-writeflow `position` | sc-xhs-images `Position` | 说明 |
|----------------------|-----------------------|------|
| `cover` | `Cover` | 封面图，停止滑动 |
| `setup` | `Content` | 铺垫/建立共鸣 |
| `core` | `Content` | 核心价值交付 |
| `payoff` | `Content` | 收获/行动清单 |
| `ending` | `Ending` | 结尾/CTA/互动 |

### 3.2 字段名映射

| sc-writeflow 字段 | sc-xhs-images 字段 | 说明 |
|-----------------|-----------------|------|
| `position` | `Position` | 首字母大写，5→3 分类映射 |
| `title` | `Title` | 主标题，加「」引号 |
| `subtitle` | `Subtitle` | 副标题 |
| `points` | `Points` | 要点列表 |
| `visual_description` | `Visual Concept` | 视觉描述 |
| `style` | `style` (frontmatter) | 全局风格，单张可覆盖 |
| `layout` | `Layout` | 单张布局 |
| `slug` | `Slug` / `Filename` | 用于生成文件名 |
| `swipe_hook` | `Swipe Hook` | 左滑引导 |
| `cta` | CTA 放入 Points | 结尾页行动号召 |

### 3.3 Style 命名（完全一致）

两边使用相同的风格名称：

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

### 3.4 Layout 命名（完全一致）

两边使用相同的布局名称：

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

## 4. 标准交接步骤（Agent 操作手册）

### 4.1 前置条件

- sc-writeflow 已完成 `draft-xhs` 阶段
- 输出文件中包含完整的 image content spec 数组

### 4.2 交接流程

```
Writeflow Draft 输出
       │
       ▼
  提取 images 数组
       │
       ├─► 校验字段完整性
       │    ├─ position 是否有效
       │    ├─ title 是否存在
       │    ├─ visual_description 是否存在
       │    ├─ style/layout 是否在可用列表
       │    └─ 张数是否在 2-9 范围内
       │
       ▼
  转换为 sc-xhs-images outline 格式
       │
       ├─► 生成 frontmatter（style、image_count）
       ├─► 逐张转换字段映射
       ├─► 生成 slug（从 title 派生）
       ├─► 生成 filename（NN-{type}-{slug}.png）
       └─► 补全 swipe_hook（如缺失）
       │
       ▼
  写入 outline.md 文件
       │
       ▼
  调用 sc-xhs-images skill
       │
       └─► ./sc-run sc-xhs-images main outline.md --yes
```

### 4.3 详细操作步骤

**Step 1: 提取并校验**

从 sc-writeflow 输出的 `## 信息图分页内容` 中提取每张图的 YAML spec，校验：
- `position` ∈ {cover, setup, core, payoff, ending}
- `style` ∈ 可用风格列表
- `layout` ∈ 可用布局列表
- 图片数量：2 ≤ N ≤ 9
- 封面图必须存在且只有一张

**Step 2: 字段转换**

将 sc-writeflow 格式转换为 sc-xhs-images outline 格式：

```python
# 伪代码示意
def convert_image_spec(spec, index, total):
    position_map = {
        'cover': 'Cover',
        'setup': 'Content',
        'core': 'Content',
        'payoff': 'Content',
        'ending': 'Ending'
    }
    
    type_map = {
        'cover': 'cover',
        'setup': 'content',
        'core': 'content',
        'payoff': 'content',
        'ending': 'ending'
    }
    
    slug = spec.get('slug') or slugify(spec['title'])
    img_type = type_map[spec['position']]
    filename = f"{index:02d}-{img_type}-{slug}.png"
    
    return {
        'position': position_map[spec['position']],
        'layout': spec['layout'],
        'slug': slug,
        'filename': filename,
        'title': spec['title'],
        'subtitle': spec.get('subtitle', ''),
        'points': spec.get('points', []),
        'visual_concept': spec['visual_description'],
        'swipe_hook': spec.get('swipe_hook', ''),
    }
```

**Step 3: 生成 outline 文件**

按 `sc-xhs-images/references/workflows/outline-template.md` 格式写入 `outline.md`。

**Step 4: 调用 sc-xhs-images**

```bash
cd /path/to/project
./sc-run sc-xhs-images main outline.md --yes
```

> 注意：`--yes` 跳过交互确认，适合自动化流水线。如需人工审核风格，可省略。

**Step 5: 收集输出**

sc-xhs-images 生成的图片默认输出到当前目录的 `outputs/` 或工作目录中，具体路径见 sc-xhs-images 文档。

---

## 5. 自动选择策略

如果 sc-writeflow 输出中未指定 `style` 或 `layout`（不推荐，但可能发生），sc-xhs-images 按以下策略自动选择：

### 5.1 Style 自动选择

基于内容类型判断：

| 内容特征 | 推荐 style |
|----------|------------|
| 干货/知识/工具 | `notion` |
| 教程/步骤/学习 | `chalkboard` 或 `study-notes` |
| 种草/好物/生活 | `cute` 或 `fresh` |
| 避坑/警示/对比 | `bold` |
| 故事/情感/个人 | `warm` |
| 数据/报告/专业 | `minimal` |

### 5.2 Layout 自动选择

基于 position 和要点数量：

| position | 要点数 | 推荐 layout |
|----------|--------|-------------|
| cover | 0-1 | `sparse` |
| setup | 2-3 | `balanced` |
| core | 3-5 | `balanced` / `list` |
| core | 5+ | `dense` |
| payoff | 3-4 | `list` / `balanced` |
| ending | 1-2 | `sparse` |

---

## 6. 端到端示例

详见 [xhs-images-input-spec.md](xhs-images-input-spec.md) 中的输入格式规范，完整示例请参考 sc-xhs-images skill 的官方文档。
