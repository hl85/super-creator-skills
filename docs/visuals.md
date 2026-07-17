# 视觉 Skill 选择指南

super-creator 有 3 个视觉内容生成 skill。本文帮助你快速选择合适的工具。

---

## 一句话决策

| 我需要… | 推荐 Skill |
|---------|-----------|
| 文章头部封面图（1 张，用于公众号/博客）| `sc-cover-image` |
| 文章各章节的内联配图（多张，自动定位）| `sc-article-illustrator` + `sc-imagine` |
| 小红书可滑动图文卡片系列（2–10 张）| `sc-xhs-images` |

---

## 详细说明

### `sc-cover-image` — 文章封面图

**适用场景：** 需要为微信公众号文章、博客文章、新闻稿生成一张题图。

**特点：**
- 5 维风格控制：type（写实/插画/…）、palette、rendering、text-overlay、mood
- 单张输出，专为横版封面比例优化
- 支持 banner、square、portrait 比例

**不适合：** 需要多张图、需要叙事或数据可视化的场景。

---

### `sc-article-illustrator` + `sc-imagine` — 章节配图

**适用场景：** 长文章需要在各章节插入对应的说明图，图片数量和位置由文章内容决定。

**特点：**
- 分析文章结构，自动推断每个章节需要什么样的图
- 生成 `batch.json` 后统一交给 `sc-imagine` 批量生成
- 最终输出带 Markdown 路径的图片集，可直接嵌入文章

**两步流程（重要）：**
1. `./sc-run sc-article-illustrator build-batch --input article.md` → 生成 `output-dir/prompts/batch.json`
2. `./sc-run sc-imagine build-batch --batchfile output-dir/prompts/batch.json` → 生成全部配图

**不适合：** 只需要一张封面、或内容以数据为主的场景。

---

### `sc-xhs-images` — 小红书图文卡片系列

**适用场景：** 内容分发目标是小红书（或其他需要竖版卡片的平台），需要 2–10 张可滑动的图文卡片。

**特点：**
- 11 种视觉风格 × 8 种布局（notion、cute、fresh 等 XHS 原生风格）
- 支持 Story-driven、Info-dense、Visual-first 三种内容策略
- 输出竖版图片，与 `sc-post-to-xhs` 配合使用完成发布

**不适合：** 横版封面、横版演示文稿、单图场景。

---

## 组合使用示例

### 完整公众号文章发布流

```
1. sc-cover-image          → 生成封面图
2. sc-article-illustrator  → 分析章节
3. sc-imagine              → 批量生成章节配图
4. sc-format-markdown      → 整理排版
5. sc-post-to-wechat       → 发布
```

### 小红书内容发布流

```
1. sc-xhs-images     → 生成图文卡片系列
2. sc-post-to-xhs    → 发布到小红书（Beta）
```
