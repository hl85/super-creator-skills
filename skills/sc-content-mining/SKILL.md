---
name: sc-content-mining
description: 从任意内容源（课程纪要、博客、播客字幕、读书笔记等）中挖掘有传播力的内容选题。先脑暴确认挖掘方向，再扫描内容提取"认知错位"模式，最后给出选题清单+呈现形式建议。Use when user asks to "挖选题", "找内容", "内容挖掘", "mine content", "scan for topics", or wants to turn content into social media content.
version: 1.1.0
---

# 内容挖掘：认知错位提取 + 选题推荐

从任意内容源中挖掘适合社交媒体传播的选题。

## Usage

All commands use `./sc-run sc-content-mining <script>`.

```bash
# 从内容源挖掘选题
./sc-run sc-content-mining mine --source article.md

# 指定目标平台
./sc-run sc-content-mining mine --source article.md --platform xhs
```

## Intents

- **选题挖掘**：从内容源提取认知错位模式，生成传播力选题
- **方向对齐**：脑暴确认目标平台、受众、调性、范围
- **形式推荐**：为每个选题推荐最佳呈现形式

## 三阶段流程

1. **Brainstorm（脑暴确认方向）**：对齐目标平台、受众、调性、范围
2. **Mine（扫描挖掘）**：扫描内容源，提取"认知错位"模式
3. **Recommend（呈现形式建议）**：为每个选题推荐呈现形式

支持的内容源：课程纪要、博客文章、播客字幕、读书笔记、会议记录、客户访谈

## Progressive Disclosure

For detailed mining frameworks and format recommendations, see:

- [references/mining-framework.md](references/mining-framework.md) - **挖掘框架、认知错位模式、传播力评分方法**
- [references/format-recommendations.md](references/format-recommendations.md) - **呈现形式推荐、效果描述、适用场景**
