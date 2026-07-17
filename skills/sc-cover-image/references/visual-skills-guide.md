# 视觉 Skill 选择指南（内联版）

super-creator 有 3 个视觉内容生成 skill。本页帮助你快速选择合适的工具。

---

## 一句话决策

| 我需要… | 推荐 Skill |
|---------|-----------|
| 文章头部封面图（1 张，用于公众号/博客）| `sc-cover-image` |
| 文章各章节的内联配图（多张，自动定位）| `sc-article-illustrator` + `sc-imagine` |
| 小红书可滑动图文卡片系列（2–10 张）| `sc-xhs-images` |

---

## 各 Skill 一句话说明

- **`sc-cover-image`** — 为公众号/博客生成单张封面题图，5 维风格控制（type / palette / rendering / text / mood），横版比例优化。
- **`sc-article-illustrator` + `sc-imagine`** — 分析长文章结构，自动定位章节配图位置，生成 batch.json 后交给 sc-imagine 批量出图。
- **`sc-xhs-images`** — 将内容拆分为 2–10 张竖版图文卡片，适配小红书等竖屏平台，11 种风格 × 8 种布局。

---

## 组合使用示例

### 完整公众号文章发布流

```
1. sc-cover-image       → 生成封面图
2. sc-article-illustrator → 分析章节
3. sc-imagine           → 批量生成章节配图
4. sc-format-markdown   → 整理排版
5. sc-publish-wechat    → 发布
```

### 小红书内容发布流

```
1. sc-xhs-images  → 生成图文卡片系列
2. sc-publish-xhs → 发布到小红书（Beta）
```
