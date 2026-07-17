# 创建新 Skills

**必读**：[Skill 编写最佳实践](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

## 核心要求

| 要求 | 详情 |
|------|------|
| **命名** | 所有 skills **必须**使用 `sc-` 前缀，采用描述性的、动词优先的命名（例如 `sc-publish-wechat`、`sc-publish-xhs`、`sc-convert-markdown-to-html`、`sc-pipeline`、`sc-writer`） |
| **name 字段** | 最多 64 字符，仅允许小写字母/数字/连字符，不得包含 "anthropic"/"claude"/"cursor"/"trae" 等 IDE 或厂商名 |
| **description** | 最多 1024 字符，第三人称，包含功能 + 使用场景 |
| **IDE 中立** | SKILL.md 和 references/ 中的文档不得绑定特定 IDE，AI 助手统一称为"AI 助手"而非具体品牌名；具体 IDE 的配置说明统一放在 `docs/ide-compatibility.md` 或 skill 的 references/ 下单独的 mcp-setup.md |
| **SKILL.md 正文** | **必须少于 30 行**；所有技术细节使用 `references/` |
| **References** | 使用 `references/` 目录；在主 SKILL.md 中记录 Intents |

## 语义化 CLI 使用

所有新 skills **必须**兼容 `./sc-run` 运行器。

**格式**：`./sc-run <skill-name> <script-name> [args...]`

运行器自动解析：
- `skills/<skill-name>/scripts/<script-name>.ts`
- 运行时检测（优先使用 `bun`）
- 绝对路径计算

## SKILL.md Frontmatter 模板

```yaml
---
name: sc-<name>
description: <第三人称描述。功能 + 使用场景。>
version: <与 marketplace.json 匹配的语义化版本>
metadata:
  openclaw:
    homepage: https://github.com/hl85/super-creator#sc-<name>
    requires:          # 仅当 skill 有脚本时包含
      anyBins:
        - bun
        - npx
---
```

## 创建步骤

1. 创建 `skills/sc-<name>/SKILL.md` 并包含 YAML front matter
2. 在 `skills/sc-<name>/scripts/` 中添加 TypeScript 代码（如适用）
3. 如有需要，在 `skills/sc-<name>/prompts/` 中添加提示词模板
4. 在插件注册文件中注册该 skill（TRAE 环境下自动加载，无需手动配置 marketplace.json）
5. 如果 skill 有脚本，在 SKILL.md 中添加 Script Directory 部分
6. 在 frontmatter 中添加 openclaw 元数据

## Skill 分组

所有 skills 注册在单一的 `super-creator` 插件下。在文档中决定 skill 应该出现在哪个分组时，使用以下逻辑分组：

| 如果你的 skill... | 使用分组 |
|-------------------|---------|
| 生成视觉内容（图片、插画） | 视觉创作 |
| 发布到平台（微信公众号、小红书） | 发布 |
| 提供 AI 生成后端 | AI 生成 |
| 转换或处理内容 | 审核与优化 |
| 选题、写作、挖掘内容 | 创作流水线 |

如果添加新的逻辑分组，更新展示分组 skills 的文档，但保持 skill 注册在单一的 `super-creator` 插件条目下。

## 编写描述

**必须使用第三人称编写**：

```yaml
# 好的示例
description: 从内容生成小红书信息图系列。当用户要求"小红书图片"、"XHS images"时使用。

# 不好的示例
description: 我可以帮你创建小红书图片
```

## Script Directory 模板

每个带脚本的 SKILL.md **必须**包含：

```markdown
## Script Directory

**重要**：所有脚本位于本 skill 的 `scripts/` 子目录中。

**Agent 执行说明**：
1. 确定此 SKILL.md 文件的目录路径为 `{baseDir}`
2. 脚本路径 = `{baseDir}/scripts/<script-name>.ts`
3. 解析 `${BUN_X}` 运行时：如果安装了 `bun` → `bun`；如果有 `npx` → `npx -y bun`；否则建议安装 bun
4. 将本文档中所有 `{baseDir}` 和 `${BUN_X}` 替换为实际值

**脚本参考**：
| 脚本 | 用途 |
|------|------|
| `scripts/main.ts` | 主入口 |
```

## 渐进式披露

对于内容丰富的 skills：

```
skills/sc-example/
├── SKILL.md              # 主指令（<500 行）
├── references/
│   ├── styles.md         # 按需加载
│   └── examples.md       # 按需加载
└── scripts/
    └── main.ts
```

从 SKILL.md 链接（仅一层深度）：
```markdown
**可用风格**：参见 [references/styles.md](references/styles.md)
```

## 扩展支持（EXTEND.md）

每个 SKILL.md **必须**包含 EXTEND.md 加载。作为步骤 1.1（工作流 skills）或"偏好设置"部分（工具类 skills）添加：

```markdown
**1.1 加载偏好设置（EXTEND.md）**

检查 EXTEND.md 是否存在（优先级顺序）：

\`\`\`bash
test -f .super-creator/<skill-name>/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/super-creator/<skill-name>/EXTEND.md" && echo "xdg"
test -f "$HOME/.super-creator/<skill-name>/EXTEND.md" && echo "user"
\`\`\`

| 路径 | 位置 |
|------|------|
| `.super-creator/<skill-name>/EXTEND.md` | 项目目录 |
| `$XDG_CONFIG_HOME/super-creator/<skill-name>/EXTEND.md` | XDG 配置（~/.config） |
| `$HOME/.super-creator/<skill-name>/EXTEND.md` | 用户主目录（旧版） |

| 结果 | 操作 |
|------|------|
| 找到 | 读取、解析、显示摘要 |
| 未找到 | 使用 AskUserQuestion 询问用户 |
```

SKILL.md 末尾应包含：
```markdown
## 扩展支持
通过 EXTEND.md 进行自定义配置。路径和支持的选项参见**步骤 1.1**。
```
