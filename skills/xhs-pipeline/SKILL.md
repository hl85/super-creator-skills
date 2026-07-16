---
name: xhs-pipeline
description: 小红书内容生产全链路流水线（内容挖掘 → 写作 → 生图 → 发布），支持任意内容源。串联 content-mining → writeflow → xhs-images → post-to-xhs 四个 skill，每步与用户确认。支持状态文件断点续跑，可从任意阶段恢复。Use when user asks to "跑一篇小红书", "XHS pipeline", "从挖掘到发布", "一键出小红书内容", "继续上次的小红书", "从状态文件恢复", or wants the full content production pipeline.
version: 2.1.0
---

# XHS Pipeline: 小红书内容生产流水线

挖掘 → 写文 → 生图 → 发布 全链路。支持任意内容源（课程纪要/博客文章/播客字幕/读书笔记等）。

## 四阶段全景

```
内容源 → [1. 挖掘] → [2. 写文] → [3. 生图] → [4. 发布] → 小红书
         content-     writeflow    xhs-       post-to-
         mining                    images     xhs
```

| 阶段 | 一句话说明 | 对应 Skill |
|------|-----------|-----------|
| 1️⃣ 挖掘 | 从内容源提取选题，确认方向 | content-mining |
| 2️⃣ 写文 | 生成小红书文案（大纲→终稿） | writeflow |
| 3️⃣ 生图 | 生成 2-9 张信息图（封面+内容图） | xhs-images |
| 4️⃣ 发布 | 手动发布（推荐） / 自动发布（MCP→CDP→手动） | post-to-xhs / xiaohongshu-mcp |

## 快速开始

### 全新开始（3 步）

```
"跑一篇小红书，从我的博客文章里挖选题"
"启动 xhs pipeline，用这份播客字幕做内容"
```

1. **准备内容源**：本地文件 / 指定目录 / 直接粘贴文本
2. **明确方向**：目标受众、内容调性、选题范围
3. **选择发布模式**：
   - 🛡️ **手动发布（推荐）**：生图完成后生成发布手册，人工手动发布，最安全
   - ⚡ **自动发布**：用 MCP / CDP 自动化发布，有风控风险
4. **跟着走**：每步确认，流水线自动推进

### 从状态文件继续（2 步）

```
"继续上次的小红书"
"从状态文件恢复 xhs pipeline"
```

1. **自动定位**：找到最近的 pipeline 状态文件
2. **断点续跑**：从上次中断的位置继续

## 核心规则

1. **每步确认**：每个 Stage 结束后必须与用户确认
2. **先写状态再询问**：Stage 完成先写 pipeline-state.json，再问用户
3. **可中断可续跑**：随时暂停，下次从状态文件恢复
4. **支持阶段回退**：可从任意已完成阶段重跑，后续自动重置
5. **发布模式前置选择**：启动时先选手动发布（推荐，安全）还是自动发布（有风控风险）
6. **手动发布默认**：默认推荐手动发布，自动发布需用户明确选择
7. **自动发布三级降级**：选择自动发布时，按 MCP → CDP → 手动 逐级降级
8. **不跳步**：不允许跳过 Brainstorm 直接挖掘
9. **路径可移植**：状态文件用相对路径，保证项目可移动

## 状态文件机制

状态文件 (`pipeline-state.json`) 是流水线的记忆核心，记录每一步的状态、输入输出和用户确认，支持断点续跑和阶段回退。

**文件位置**：`.course/xhs-{topic-slug}/pipeline-state.json`

**为什么需要**：
- 流水线可能跨多次对话，需要持久化进度
- 每步用户确认的结果需要记录
- 支持从任意阶段回退重跑

完整 Schema 和状态转移图见 [references/state-management.md](references/state-management.md)

## 常见问题 Top3

**Q: 内容源可以是什么？**
A: 任意文本素材——课程纪要、博客文章、播客字幕、读书笔记、产品文档都行。

**Q: 可以跳过某个阶段吗？**
A: 可以。比如自己有图，就跳过生图阶段直接到发布。

**Q: 发布失败了怎么办？**
A: 选手动发布模式最安全，自动化发布有三级降级：MCP 优先，不行用 CDP 脚本，再不行生成手动发布手册。

**Q: 手动发布和自动发布怎么选？**
A: 推荐手动发布——内容生产（挖写画）已经自动化了，最后一步手动点发布最安全，避免账号被风控。如果追求全自动化且能接受风险，可选自动发布。

## Progressive Disclosure

深入阅读按需要查阅：

- 📖 [references/stage-guides.md](references/stage-guides.md) - **四阶段详细操作指南（步骤/Checkpoint/输入输出/FAQ）**
- 📖 [references/state-management.md](references/state-management.md) - **状态文件完整 Schema + 状态转移图 + 错误恢复策略**
- 📖 [references/mcp-setup.md](references/mcp-setup.md) - **xiaohongshu-mcp 安装配置 + 三级降级策略详解**
