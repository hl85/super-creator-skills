# Writeflow 通用化改造实施计划

## 概述

将 writeflow skill 中与面试辅导强绑定的内容进行通用化改造，采用「通用化 + 面试辅导作为默认示例」的方案。

## 修改文件清单

### 1. `skills/writeflow/references/content-mining.md`（重写）

**当前状态**：整个文件都是面试辅导挖掘流程，包括库存盘点、挖掘步骤、认知错位类型等。

**改造方案**：
- 改为「如何从 content-mining 输出衔接 writeflow」的通用说明文档
- 保留面试辅导场景作为「示例：面试辅导内容如何衔接」
- 增加通用衔接流程：
  - 输入：content-mining 的 Phase 3 输出（选题清单 + 呈现形式建议）
  - 步骤：选 topic → 确认定位 → 调 outline-xhs → 调 draft-xhs
  - 字段映射：mining 输出字段 → writeflow 输入字段

**新文档结构**：
```
# Content Mining → Writeflow 衔接指南

## 概述
- 本文档说明如何将 content-mining 的输出衔接到 writeflow 工作流
- 适用场景：任何内容挖掘 → 内容创作的衔接

## 输入：content-mining Phase 3 输出格式
- 选题清单结构说明
- 呈现形式建议字段说明

## 通用衔接流程
Step 1: 选择选题（从选题清单中挑选）
Step 2: 确认定位（读者画像 + 核心主张）
Step 3: 调用 outline-xhs 生成大纲
Step 4: 调用 draft-xhs 生成草稿

## 字段映射表
| mining 输出字段 | writeflow 输入字段 | 说明 |
|----------------|-------------------|------|
| ...            | ...               | ...  |

## 示例：面试辅导内容如何衔接
- （保留原文档的核心内容，作为完整示例展示）
- 面试辅导场景的 mining 输出样例
- 面试辅导场景的衔接步骤演示
```

---

### 2. `skills/writeflow/prompts/draft-xhs.md`（修改）

**当前状态**：标签示例全是面试/求职相关（#面试、#求职、#程序员面试、#大厂面试、#面试技巧）。

**改造方案**：
- 保留原有的面试/求职标签示例，但标注为「示例 1：求职/面试类」
- 增加多行业标签示例：
  - 示例 2：职场成长类
  - 示例 3：创业/商业类
  - 示例 4：育儿/亲子类
  - 示例 5：学习/教育类
  - 示例 6：技术/编程类
- 其他内容保持不变

**修改位置**：Step 3 — Write tags 部分（第 75-84 行）

---

### 3. `skills/writeflow/prompts/outline-xhs.md`（修改）

**当前状态**：reader 举例只有求职/前端一个例子。

**改造方案**：
- 保留原有的求职/前端示例，标注为「示例 1：求职/面试类」
- 增加 2 个其他行业示例：
  - 示例 2：职场成长类（如：30+职场人、职场晋升）
  - 示例 3：创业/副业类（如：初创团队创始人、副业探索）
- 其他内容保持不变

**修改位置**：Step 3 — Identify the reader 部分的示例（第 23 行）

---

### 4. `skills/writeflow/SKILL.md`（小修改）

**当前状态**：
- 版本号：0.1.0
- description：已是通用描述，无明显面试辅导字样
- Progressive Disclosure：未引用 content-mining 衔接文档

**改造方案**：
- 版本号：0.1.0 → 0.2.0
- description：保持不变（已是通用描述）
- Progressive Disclosure 增加 content-mining 衔接文档的引用：
  - 在 references 列表中添加 `[references/content-mining.md](references/content-mining.md) - **Content Mining → Writeflow 衔接指南**`

**修改位置**：
- 第 4 行：version 字段
- 第 35-39 行：Progressive Disclosure 列表

---

## 注意事项

1. **保持文档风格一致**：所有修改遵循原文档的专业指令性语气
2. **面试辅导例子不删除**：标注为示例或作为多个示例之一
3. **确保 xhs-to-images-handover.md 一致性**：不需要修改该文件，确保改动不影响其引用
4. **字段命名保持一致**：新增内容的字段命名与现有规范对齐
5. **不添加冗余注释**：保持文档简洁，不添加不必要的注释

## 实施顺序

1. 重写 content-mining.md（最大改动，优先完成）
2. 修改 draft-xhs.md（标签示例扩展）
3. 修改 outline-xhs.md（读者画像示例扩展）
4. 修改 SKILL.md（版本号 + 引用更新）
