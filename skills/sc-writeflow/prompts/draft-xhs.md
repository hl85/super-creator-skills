# Draft Procedure — Xiaohongshu 小红书

Run **after** outline is confirmed. Produces the final caption + image content spec.

## Input

Read the confirmed `outline.md` from the outline stage.

## Step 1 — Write caption

Follow `references/xhs-style.md` constraints:

- **200-500 字**, short and punchy
- **1-3 行 per paragraph** (mobile screen shows 3-4 paragraphs)
- **Emoji as visual separators** (🎫💰🔥⚠️), max 1-2 per paragraph
- Structure: Hook → Core → CTA

### Hook patterns (≤ 50 字)

1. **痛点切入**: "你有没有这种感觉——明明技术不差，但面试就是过不了"
2. **反认知断言**: "说句扎心的——你花 90% 精力准备的东西，其实只是入场券"
3. **数字冲击**: "辅导了 13 个学员后发现，90% 的人都搞错了面试的方向"

### Core patterns

- 真实案例 > 抽象论述
- 引用纪要原话增加真实感
- 用 ❌/✅ 对比强化记忆

### CTA patterns

- "👆左滑看全部→"
- "你是哪种情况？评论区说说"
- "收藏起来，下次面试前翻出来看"
- "@你那个需要看的朋友"

## Step 2 — Write image content specs

For each image from the outline, produce a detailed content spec for sc-xhs-images:

```yaml
image:
  position: cover  # cover | setup | core | payoff | ending
  title: "..."     # 大标题 (for AI image prompt)
  subtitle: "..."   # 副标题 (optional)
  points:
    - "要点 1"
    - "要点 2"
  visual_description: "..."  # 视觉概念/画面描述
  layout: sparse         # from sc-xhs-images layout gallery
  style: bold            # from sc-xhs-images style gallery
  slug: "..."            # 可选，简短标识 kebab-case，用于文件名
  swipe_hook: "..."      # 可选，左滑引导语（结尾页不用）
  cta: "..."             # 可选，行动号召（仅 ending 用）
```

### Image content rules

- Each image = ONE key point, never more than 2
- Cover: title only, maximum visual impact
- Content pages: title + 2-4 bullet points max
- Keep text minimal — AI image generation struggles with long Chinese text
- Prefer keywords + short phrases over full sentences

### 字段命名约定（与 sc-xhs-images 对齐）

| 字段 | 说明 | 可用值 |
|------|------|--------|
| `position` | 图片位置 | `cover` / `setup` / `core` / `payoff` / `ending` |
| `style` | 视觉风格 | `cute` / `fresh` / `notion` / `chalkboard` / `study-notes` / `bold` / `minimal` / `warm` / `retro` / `pop` / `screen-print` |
| `layout` | 信息布局 | `sparse` / `balanced` / `dense` / `list` / `comparison` / `flow` / `mindmap` / `quadrant` |

> 完整的衔接规范见 [references/xhs-to-images-handover.md](../references/xhs-to-images-handover.md)

## Step 3 — Write tags

3-5 个标签，结构：1 个大流量 + 1-2 个精准 + 1 个内容类型。

### 示例 1：面试辅导/求职

```yaml
tags:
  - "#面试"          # 大流量
  - "#求职"          # 大流量
  - "#程序员面试"     # 精准
  - "#大厂面试"       # 精准
  - "#面试技巧"       # 内容类型
```

### 示例 2：职场成长/效率

```yaml
tags:
  - "#职场"          # 大流量
  - "#工作效率"       # 大流量
  - "#职场干货"       # 精准
  - "#时间管理"       # 精准
  - "#成长心得"       # 内容类型
```

### 示例 3：知识付费/学习

```yaml
tags:
  - "#学习"          # 大流量
  - "#知识付费"       # 大流量
  - "#自我提升"       # 精准
  - "#学习方法"       # 精准
  - "#干货分享"       # 内容类型
```

## Step 4 — Assemble final output

```markdown
# 小红书内容方案

## 标题
[title]

## 正文 (caption)
[caption text with emoji and formatting]

## 标签
[tags]

## 信息图分页内容 (N 张)
### 图 1: 封面
[content spec]

### 图 2: ...
...
```

## Step 5 — 输出交接格式

生成完内容后，将 image content spec 以结构化 YAML 输出，方便后续交给 sc-xhs-images skill 执行。

### 完整输出结构

```markdown
# 小红书内容方案

## 标题
[title]

## 正文 (caption)
[caption text with emoji and formatting]

## 标签
[tags]

## 信息图分页内容 (N 张)

```yaml
images:
  - position: cover
    title: "..."
    subtitle: "..."
    points: []
    visual_description: "..."
    layout: sparse
    style: bold
    slug: "main-title"
    swipe_hook: "左滑看详情→"

  - position: setup
    title: "..."
    points:
      - "..."
      - "..."
    visual_description: "..."
    layout: balanced
    style: bold
    slug: "pain-points"
    swipe_hook: "真相居然是..."

  - position: core
    title: "..."
    points:
      - "..."
      - "..."
    visual_description: "..."
    layout: balanced
    style: bold
    slug: "core-truth"
    swipe_hook: "怎么做？往下看"

  - position: payoff
    title: "..."
    points:
      - "..."
      - "..."
    visual_description: "..."
    layout: list
    style: bold
    slug: "action-steps"
    swipe_hook: "最后总结一下"

  - position: ending
    title: "..."
    subtitle: "..."
    points: []
    visual_description: "..."
    layout: sparse
    style: bold
    slug: "summary-cta"
    cta: "收藏备用 | 评论区聊聊"
```

```

### 调用 sc-xhs-images 指引

草稿输出后，按以下步骤交给 sc-xhs-images 生成图片：

1. **确认输出完整性**：检查 images 数组包含所有必填字段
   - ✅ 每张图都有 `position` / `title` / `visual_description` / `style` / `layout`
   - ✅ 有且仅有一张 `position: cover`
   - ✅ 图片张数在 2-9 之间

2. **转换为 sc-xhs-images outline 格式**（详见 [references/xhs-to-images-handover.md](../references/xhs-to-images-handover.md)）：
   - 将 YAML images 数组转换为 sc-xhs-images 的 outline markdown 格式
   - 生成 frontmatter（style、image_count 等）
   - 自动生成 slug 和 filename

3. **调用 sc-xhs-images skill**：
   ```bash
   ./sc-run sc-xhs-images main outline.md --yes
   ```

4. **收集输出**：
   - 图片默认输出到工作目录下，文件名如 `01-cover-xxx.png`
   - 配合正文和标签即可发布

> 详细交接规范见 [references/xhs-to-images-handover.md](../references/xhs-to-images-handover.md)

## Quality checklist

- [ ] 封面标题 ≤ 15 字
- [ ] 正文 ≤ 500 字
- [ ] 每张图 ≤ 2 个要点
- [ ] 正文有 emoji 分隔但不过量
- [ ] 有左滑引导
- [ ] 有互动 CTA
- [ ] 标签 3-5 个
- [ ] 内容来自真实纪要（无虚构）
- [ ] image spec 字段与 sc-xhs-images 命名一致
- [ ] style / layout 值在可用列表中
