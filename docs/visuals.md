# 视觉 Skill 选择指南

super-creator 有 6 个视觉内容生成 skill。本文帮助你快速选择合适的工具。

---

## 一句话决策

| 我需要… | 推荐 Skill |
|---------|-----------|
| 文章头部封面图（1 张，用于公众号/博客）| `cover-image` |
| 文章各章节的内联配图（多张，自动定位）| `article-illustrator` + `imagine` |
| 把数据/流程/概念做成单张信息图 | `infographic` |
| 小红书可滑动图文卡片系列（2–10 张）| `xhs-images` |
| 教育/知识类漫画（分格叙事）| `comic` |
| 演示文稿（可导出 PPTX / PDF）| `slide-deck` |

---

## 详细说明

### `cover-image` — 文章封面图

**适用场景：** 需要为微信公众号文章、博客文章、新闻稿生成一张题图。

**特点：**
- 5 维风格控制：type（写实/插画/…）、palette、rendering、text-overlay、mood
- 单张输出，专为横版封面比例优化
- 支持 banner、square、portrait 比例

**不适合：** 需要多张图、需要叙事或数据可视化的场景。

---

### `article-illustrator` + `imagine` — 章节配图

**适用场景：** 长文章需要在各章节插入对应的说明图，图片数量和位置由文章内容决定。

**特点：**
- 分析文章结构，自动推断每个章节需要什么样的图
- 生成 `batch.json` 后统一交给 `imagine` 批量生成
- 最终输出带 Markdown 路径的图片集，可直接嵌入文章

**两步流程（重要）：**
1. `./sc-run article-illustrator build-batch --input article.md` → 生成 `output-dir/prompts/batch.json`
2. `./sc-run imagine build-batch --batchfile output-dir/prompts/batch.json` → 生成全部配图

**不适合：** 只需要一张封面、或内容以数据为主的场景。

---

### `infographic` — 信息图

**适用场景：** 需要把复杂数据、流程、比较、统计做成一张视觉清晰的图表。

**特点：**
- 21 种布局 × 20 种视觉风格
- 支持时间线、流程图、比较矩阵、统计图等形式
- 单张输出，适合作为文章配图或独立发布

**不适合：** 文字叙事型内容、需要多张卡片的 XHS 发布场景。

---

### `xhs-images` — 小红书图文卡片系列

**适用场景：** 内容分发目标是小红书（或其他需要竖版卡片的平台），需要 2–10 张可滑动的图文卡片。

**特点：**
- 11 种视觉风格 × 8 种布局（notion、cute、fresh 等 XHS 原生风格）
- 支持 Story-driven、Info-dense、Visual-first 三种内容策略
- 输出竖版图片，与 `post-to-xhs` 配合使用完成发布

**不适合：** 横版封面、横版演示文稿、单图场景。

---

### `comic` — 教育漫画

**适用场景：** 内容需要以漫画形式呈现，如知识科普、流程演示、趣味解读。

**特点：**
- 艺术风格（写实、Q版、像素等）× 基调（轻松、严肃、幽默等）× 版式（网格、连续等）
- 分格叙事，适合有明确故事线或步骤顺序的内容

**不适合：** 数据可视化、封面图、演示文稿。

---

### `slide-deck` — 演示文稿

**适用场景：** 需要生成可用于会议、课程、直播的演示文稿。

**特点：**
- 从 Markdown 或内容大纲自动生成分页幻灯片
- 支持导出为 PPTX（可在 PowerPoint / Keynote 中继续编辑）或 PDF
- 多种主题和配色方案

**不适合：** 社交媒体发布（格式不匹配）、单张配图。

---

## 组合使用示例

### 完整公众号文章发布流

```
1. cover-image          → 生成封面图
2. article-illustrator  → 分析章节
3. imagine              → 批量生成章节配图
4. format-markdown      → 整理排版
5. post-to-wechat       → 发布
```

### 小红书内容发布流

```
1. xhs-images     → 生成图文卡片系列
2. post-to-xhs    → 发布到小红书（Beta）
```

### 演讲/课程内容流

```
1. writeflow      → 生成内容大纲
2. slide-deck     → 转为演示文稿（PPTX 导出）
3. cover-image    → 生成配套封面（用于发布预告）
```
