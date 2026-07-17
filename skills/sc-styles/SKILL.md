---
name: sc-styles
description: 统一图像风格库。为所有生图和配图 skill 提供标准化的视觉风格定义、调色板和提示词模板。当需要选择图片风格、查询风格定义、或构建生图提示词时使用。
version: 1.0.0
metadata:
  pattern: tool-wrapper
  domain: image-styles
---

# sc-styles — 统一图像风格库

这是一个 **Tool Wrapper** 模式的共享 skill，为 super-creator-skills 生态中所有生图和配图相关 skill 提供统一的视觉风格定义。

## 设计理念

- **单一数据源**：所有风格定义集中管理，避免各 skill 重复维护导致不一致
- **渐进式加载**：SKILL.md 只做索引，具体风格定义按需从 `references/styles/` 加载
- **统一命名**：所有风格使用 kebab-case ID，跨 skill 保持一致
- **标准化格式**：每个风格文件遵循统一结构，包含氛围、调色板、视觉元素、提示词模板等

## 何时使用

- 选择图片风格时，先加载 `references/catalog.md` 浏览可用风格
- 构建生图提示词时，加载对应风格文件获取完整提示词模板和调色板
- 任何需要引用视觉风格的场景

## 风格分类

风格按语义分为四大类：

| 分类 | 说明 | 典型风格 |
|------|------|---------|
| **技法/媒介** | 强调绘制技法和材质 | watercolor, pixel-art, chalkboard, screen-print, sketch |
| **情绪/氛围** | 强调情感和感受 | warm, elegant, minimal, playful, bold, retro |
| **设计范式** | 强参考系/品牌感 | notion, blueprint, flat, editorial, scientific, kawaii |
| **特殊/创意** | 独特视觉概念 | lego-brick, claymation, origami, cyberpunk-neon, ikea-manual |

## 使用方式

### 浏览风格目录
加载 `references/catalog.md` 查看完整风格列表，含每个风格的一句话描述和适用场景。

### 加载具体风格
从 `references/styles/{style-id}.md` 加载单个风格的完整定义，包含：
- Atmosphere：氛围描述
- Color Palette：调色板（含 Hex 值）
- Visual Elements：核心视觉元素
- Style Rules：Do/Don't 规则
- Example Prompt：可直接使用的提示词模板
- Best For：最佳适用场景

### 组合风格
- **基础风格**：选择 1 个主风格作为基础
- **叠加调色板**：可叠加情绪类风格调整色调（如 warm + blueprint）
- 不要同时叠加多个技法类风格（如不要同时 watercolor + pixel-art）

## 风格数量

当前收录 **60+ 种** 视觉风格，覆盖：
- 文章配图（22 种）
- 封面图（渲染 × 调色板组合）
- 小红书卡片（11 种预设）
- 信息图（20 种特色风格）
- 漫画（5 种艺术风格 + 7 种色调）
- 幻灯片（16 种演示风格）

## 文件结构

```
sc-styles/
├── SKILL.md                    # 本文件：索引 + 使用协议
└── references/
    ├── catalog.md              # 风格总目录
    └── styles/                 # 所有风格定义（kebab-case）
        ├── aged-academia.md
        ├── blueprint.md
        ├── chalkboard.md
        ├── ...
        └── watercolor.md
```

## 供其他 Skill 引用

其他 skill 应在自己的 SKILL.md 中这样引用：

```markdown
## 风格选择

加载 `sc-styles/references/catalog.md` 浏览可用风格。
选中风格后，加载 `sc-styles/references/styles/{style-id}.md` 获取完整定义。
将风格的 Example Prompt 整合到你的生图提示词中。
```

## 扩展新风格

新增风格时：
1. 在 `references/styles/` 下创建 `{style-id}.md`
2. 遵循现有风格文件的标准结构
3. 在 `references/catalog.md` 中添加条目
4. 风格 ID 使用 kebab-case，避免与现有风格重名
