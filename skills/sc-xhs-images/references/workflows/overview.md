# XHS Images Workflow Overview

sc-xhs-images skill 的完整工作流程总览，涵盖从输入到输出的全链路。

---

## 1. 工作流程总览

```
输入 (Input)
   │
   ▼
内容分析 (Analysis) → analysis-framework.md
   │
   ▼
大纲生成 (Outline) → outline-template.md
   │
   ▼
提示词组装 (Prompt Assembly) → prompt-assembly.md
   │
   ▼
图片生成 (Generation)
   │
   ▼
输出 (Output)
```

---

## 2. 输入方式

sc-xhs-images 支持多种输入方式：

| 输入方式 | 说明 | 适用场景 | 详细文档 |
|----------|------|----------|----------|
| Markdown 文章 | 自动分析并生成 | 长文转图 | analysis-framework.md |
| Outline 文件 | 预定义大纲 | 批量生成 / 程序化调用 | outline-template.md |
| Writer 输出 | 从 sc-writer skill 衔接 | 内容创作流水线 | writeflow-input.md |

### 2.1 从 Writer 输入

sc-writer 是内容创作的上游 skill，负责将原始素材转化为平台化的内容方案。

**输入格式**：sc-writer 的 `draft-xhs` 阶段输出的 image content spec（YAML 格式）

**处理步骤**：
1. 解析 sc-writer 输出的 images 数组
2. 字段映射与转换（position 5→3 分类等）
3. 生成 sc-xhs-images 标准 outline
4. 执行图片生成

**详细文档**：[writeflow-input.md](writeflow-input.md)

---

## 3. 内容分析阶段

在生成图片前，先对内容进行深度分析：

- 内容类型分类（种草/干货/故事/测评等）
- 目标受众分析
- 钩子强度评估
- 互动潜力分析（收藏/分享/评论）
- 视觉机会识别
- 滑动流设计

**详细文档**：[analysis-framework.md](analysis-framework.md)

---

## 4. 大纲生成阶段

将分析结果转化为结构化的图片系列大纲：

- 多策略生成（A 故事驱动 / B 信息密度 / C 视觉优先）
- 每张图的位置、布局、内容规划
- 风格与布局选择
- 滑动钩子设计

**详细文档**：[outline-template.md](outline-template.md)

---

## 5. 提示词组装阶段

根据大纲组装每张图的生成提示词：

- 加载风格预设（style preset）
- 加载布局配置
- 组装内容部分
- 添加水印（如启用）
- 视觉一致性控制（参考图链）

**详细文档**：[prompt-assembly.md](prompt-assembly.md)

---

## 6. 图片生成阶段

按顺序生成图片系列：

1. 第 1 张（封面）：无参考图生成，建立视觉基准
2. 第 2+ 张：使用第 1 张作为风格参考，保持系列一致性
3. 所有图片使用相同的风格和配色

---

## 7. 输出规范

### 7.1 文件命名

```
NN-{type}-{slug}.png
```

- `NN`: 两位序号（01, 02, ...）
- `type`: `cover` / `content` / `ending`
- `slug`: 简短描述（kebab-case）

**示例**：
- `01-cover-ai-tools.png`
- `02-content-why-ai.png`
- `06-ending-summary.png`

### 7.2 输出位置

默认输出到当前工作目录，可通过参数指定输出路径。

---

## 8. 相关文档

- [analysis-framework.md](analysis-framework.md) - 内容分析框架
- [outline-template.md](outline-template.md) - 大纲模板
- [prompt-assembly.md](prompt-assembly.md) - 提示词组装指南
- [writeflow-input.md](writeflow-input.md) - 从 Writer 输入
- [writeflow-output-spec.md](writeflow-output-spec.md) - Writer 输出格式规范
