# 四阶段操作指南

本指南详细说明 XHS Pipeline 四个阶段的操作步骤、Checkpoint 清单、输入输出格式及常见问题。

---

## Stage 1: 内容挖掘（content-mining skill）

### 详细操作步骤

1. **Brainstorm**：用 AskUserQuestion 与用户确认挖掘方向
   - 目标平台、受众、调性、范围、核心逻辑
2. **Mine**：扫描内容源，提取"认知错位"模式
3. **Recommend**：输出选题清单 + 呈现形式建议（含效果描述）
4. **Checkpoint**：用户确认选题和呈现形式

### Checkpoint 清单

- [ ] 选题方向是否符合用户预期
- [ ] 呈现形式（图文/视频/笔记类型）是否确认
- [ ] 目标受众和调性是否明确
- [ ] 内容源范围是否清晰

### 输入输出格式

**Inputs:
```json
{
  "brainstorm": {
    "platform": "xiaohongshu",
    "audience": "目标受众",
    "tone": "内容调性",
    "scope": "内容源范围",
    "core_logic": "核心理念一句话"
  }
}
```

**Outputs:**
```json
{
  "mining_output": ".super/{project-title}/mining/topics.md",
  "selected_topic_index": 2
}
```

### 常见问题与注意事项

**Q: 内容源可以是什么格式？**
A: 支持 Markdown/TXT/文档等任意文本素材，课程纪要、博客文章、播客字幕、读书笔记均可。

**Q: 面试辅导场景有什么特殊要求？**
A: 目录结构通常为 `interviews/学员名/纪要.md`，按日期或学员组织。

**Q: 挖掘不出好的选题用户都不满意怎么办？**
A: 调整 brainstorm 参数（扩大范围或调整调性后重新挖掘，不要硬凑。

---

## Stage 2: 文案撰写（writeflow skill, platform=xhs）

### 详细操作步骤

1. **Outline**：基于 mining 输出，按 `prompts/outline-xhs.md` 生成大纲
   - 标题、封面 hook、图片系列规划、正文结构
2. **Draft**：按 `prompts/draft-xhs.md` 生成终稿
   - caption 正文 + 图片内容规格 + 标签
3. **Checkpoint**：用户确认文案

### Checkpoint 清单

- [ ] 标题是否有吸引力
- [ ] 封面 hook 是否抓人
- [ ] 正文结构是否清晰
- [ ] 图片规划是否合理（张数和内容
- [ ] 标签是否精准
- [ ] 整体调性是否符合预期

### 输入输出格式

**Inputs:**
```json
{
  "source": ".super/{project-title}/mining/topics.md",
  "topic_index": 2,
  "platform": "xhs"
}
```

**Outputs:**
```json
{
  "outline": ".super/{project-title}/draft/outline.md",
  "content": ".super/{project-title}/draft/content.md",
  "caption": ".super/{project-title}/draft/caption.txt"
}
```

### 常见问题与注意事项

**Q: 大纲和终稿的关系是什么？**
A: 先出大纲确认结构，再写终稿，避免大返工。

**Q: caption.txt 是什么？**
A: 从终稿中提取的纯正文内容，用于发布时直接使用。

**Q: 图片规划要规划几张图合适？**
A: 通常 2-9 张，根据内容复杂度决定，封面图是必须的。

---

## Stage 3: 信息图生成（xhs-images skill）

### 详细操作步骤

1. **Style Selection**：基于 mining 推荐的风格+布局
2. **Prompt Assembly**：按 `references/workflows/prompt-assembly.md` 组装提示词
3. **Generation**：生成 2-9 张信息图
   - 图 1 先生成（无参考）
   - 图 2+ 以图 1 为参考保持一致性
4. **Checkpoint**：用户确认图片质量

### Checkpoint 清单

- [ ] 封面图是否抓人眼球
- [ ] 风格是否统一
- [ ] 内容是否清晰可读
- [ ] 张数是否合适
- [ ] 整体视觉效果是否达标

### 输入输出格式

**Inputs:**
```json
{
  "content_file": ".super/{project-title}/draft/content.md",
  "style": "notion | bold | chalkboard | ...",
  "layout": "dense | flow | list | balanced | ..."
}
```

**Outputs:**
```json
{
  "images": [
    ".super/{project-title}/images/01-cover.png",
    ".super/{project-title}/images/02-xxx.png"
  ],
  "style_used": "notion",
  "layout_used": "dense"
}
```

### 常见问题与注意事项

**Q: 为什么图 1 要先生成？**
A: 图 1 是封面，也是后续图片的风格参考，保证系列一致性。

**Q: 图片生成失败怎么办？**
A: 单张图重试，或减少图片数量，或换风格重试。

**Q: 风格和布局怎么选？**
A: 根据内容调性和 mining 推荐，也可以让用户选。

---

## Stage 4: 发布阶段

### 发布模式选择

发布阶段有两种模式，在 **pipeline 启动时**由用户选择：

| 模式 | 说明 | 推荐度 | 风险 |
|------|------|--------|------|
| 🛡️ **manual（手动发布）** | 生成发布手册，用户手动在小红书 App / 网页发布 | ⭐⭐⭐⭐⭐ 推荐 | 无风险 |
| ⚡ **auto（自动发布）** | 自动化发布，三级降级：MCP → CDP → 手动 | ⭐⭐ | 有风控风险 |

> **为什么默认推荐手动发布？**
> 小红书对自动化工具检测较严，使用浏览器自动化发布有账号违规风险。内容生产（挖掘→写文→生图）已经能省 80% 的时间，最后一步手动点发布更安全。

### 手动发布模式（manual）

当 `publish_mode: "manual"` 时，发布阶段的流程：

1. 生图完成后，自动生成 **发布手册** `publish/PUBLISH-MANUAL.md`（在项目目录下），包含：
   - 笔记标题
   - 正文文案（带表情符号和话题标签）
   - 图片列表（按顺序）
   - 发布步骤指引
2. 用户确认内容无误
3. 手动在小红书 App 或网页版发布
4. 将发布链接回填到状态文件

### 自动发布模式（auto）— 三级降级策略

当 `publish_mode: "auto"` 时，采用**三级降级策略**，优先使用最稳定的方式：

```
┌─────────────────┐
│  Level 1: MCP   │  ← 优先（最稳定）
│ xiaohongshu-mcp │
└────────┬────────┘
         │ 不可用/失败
         ▼
┌─────────────────┐
│  Level 2: CDP   │  ← Fallback
│ post-to-xhs 脚本 │
└────────┬────────┘
         │ 不可用/失败
         ▼
┌─────────────────┐
│ Level 3: Manual │  ← 最终兜底
│  手动发布手册    │
└─────────────────┘
```

#### 方法选择逻辑

按以下优先级自动选择发布方式：

| 优先级 | 方式 | 触发条件 | 说明 |
|--------|------|----------|------|
| 1️⃣ 最高 | **xiaohongshu-mcp** | MCP 服务运行且已登录 | 本地 MCP 服务，API 方式发布，最稳定 |
| 2️⃣ 次之 | **post-to-xhs CDP** | Chrome 可用且已登录 | Chrome 浏览器自动化脚本 |
| 3️⃣ 兜底 | **手动发布** | 前两种都失败 | 生成 PUBLISH-MANUAL.md，用户手动发 |

**自动检测流程**：
1. 尝试连接 `http://localhost:18060/mcp
2. 调用 `check_login` 检查登录状态
3. 已登录 → 用 MCP 发布
4. 未登录或连接失败 → 降级到 CDP 脚本
5. CDP 也失败 → 生成手动发布手册

#### Level 1: MCP 方式操作说明（推荐）

如果 xiaohongshu-mcp 服务可用，直接调用 `publish_content` 工具：

**输入准备**：
- 从 `content.md` 提取标题
- 从 `caption.txt` 读取正文内容
- 从 `images/` 目录获取所有图片（绝对路径）
- 从内容中提取或使用默认标签

**调用示例**：

```
publish_content(
  title: "笔记标题",
  content: "正文内容...",
  images: [
    "/path/to/.super/xhs-xxx/images/01-cover.png",
    "/path/to/.super/xhs-xxx/images/02-xxx.png"
  ],
  tags: ["标签1", "标签2"]
)
```

**发布步骤**：
1. 确认 MCP 服务连接正常
2. 检查登录状态（`check_login`）
3. 组装发布参数（标题、正文、图片路径、标签）
4. 调用 `publish_content` 发布
5. 返回 `post_url` 和 `note_id`
6. 更新状态文件，记录发布结果

#### Level 2: CDP 方式操作说明（Fallback）

MCP 不可用时，降级到 post-to-xhs 的 CDP 脚本：

```bash
cd /path/to/post-to-xhs/scripts && npx -y bun xhs-post.ts note \
  --title "笔记标题" \
  --caption-file /path/to/caption.txt \
  --image /path/to/01-cover.png \
  --image /path/to/02-xxx.png \
  --tag 标签1 --tag 标签2
```

默认预览模式，不自动发布，用户确认后再加 `--publish`。

#### Level 3: 手动发布（最终兜底）

前两种方式都失败时，生成 `PUBLISH-MANUAL.md` 手动发布手册，包含：
- 标题
- 正文
- 图片路径列表
- 标签
- 发布链接和步骤说明

**手动发布操作指引**：

1. 打开小红书创作者平台（https://creator.xiaohongshu.com）
2. 登录账号
3. 点击「发布笔记」
4. 上传图片（按顺序）
5. 填写标题
6. 粘贴正文
7. 添加话题标签
8. 预览确认后发布
9. 复制发布链接回填到状态文件

### 发布确认 Checkpoint 清单

- [ ] 发布模式正确（手动 / 自动）
- [ ] 发布方式选择正确（MCP / CDP / 手动）
- [ ] 标题正确
- [ ] 正文无误
- [ ] 图片顺序正确
- [ ] 标签齐全
- [ ] 预览效果确认
- [ ] 发布链接已保存

### 输入输出格式

**Inputs:**
```json
{
  "title": "笔记标题",
  "caption_file": ".super/{project-title}/draft/caption.txt",
  "images": [".super/{project-title}/images/01-cover.png", "..."],
  "tags": ["标签1", "标签2", "标签3"],
  "method": "mcp | cdp | manual",
  "publish_mode": "preview | publish"
}
```

**Outputs:**
```json
{
  "published": true,
  "post_url": "https://www.xiaohongshu.com/discovery/item/...",
  "method_used": "cdp",
  "publish_manual": ".super/{project-title}/publish/PUBLISH-MANUAL.md"
}
```

### 常见问题与注意事项

**Q: 为什么默认预览模式？**
A: 发布是不可逆操作，先预览确认后再发布，避免误发。

**Q: MCP 和 CDP 有什么区别？**
A: MCP 是 API 方式，更稳定，不需要打开浏览器；CDP 是浏览器自动化，依赖 Chrome。

**Q: 手动发布后怎么记录？**
A: 生成 PUBLISH-MANUAL.md，用户手动发完后把链接告诉 AI，AI 更新状态文件。

**Q: 发布失败了怎么办？**
A: 先看错误信息，能重试就重试，不行就降级，都不行就手动。
