# 视觉 Skill 选择指南（内联版）

super-creator 有 6 个视觉内容生成 skill。本页帮助你快速选择合适的工具。

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

## 各 Skill 一句话说明

- **`cover-image`** — 为公众号/博客生成单张封面题图，5 维风格控制（type / palette / rendering / text / mood），横版比例优化。
- **`article-illustrator` + `imagine`** — 分析长文章结构，自动定位章节配图位置，生成 batch.json 后交给 imagine 批量出图。
- **`infographic`** — 把数据、流程、比较、概念做成单张高密度信息图，21 种布局 × 20 种风格。
- **`xhs-images`** — 将内容拆分为 2–10 张竖版图文卡片，适配小红书等竖屏平台，11 种风格 × 8 种布局。
- **`comic`** — 以分格漫画形式呈现知识科普、流程演示，艺术风格 × 基调 × 版式三维组合。
- **`slide-deck`** — 从 Markdown 自动生成分页演示文稿，支持导出 PPTX / PDF，多种主题配色。

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
