# 小红书（xhs）平台阶段详解

本指南详细说明 sc-pipeline 在小红书平台下 5 个阶段的操作步骤、Checkpoint 清单、输入输出格式及常见问题。

**阶段流转**：mining → writing → imaging → review（硬闸门）→ publishing

---

## Stage 1: 内容挖掘（sc-content-mining skill）

### 详细操作步骤

1. **Brainstorm**：用 AskUserQuestion 与用户确认挖掘方向
   - 目标平台（xhs）、受众、调性、范围、核心逻辑
2. **Mine**：扫描内容源，提取"认知错位"模式
3. **Recommend**：输出选题清单 + 呈现形式建议（含效果描述）
4. **Checkpoint**：用户确认选题和呈现形式

### Checkpoint 清单

- [ ] 选题方向是否符合用户预期
- [ ] 呈现形式（图文/视频/笔记类型）是否确认
- [ ] 目标受众和调性是否明确
- [ ] 内容源范围是否清晰

### 输入输出格式

**Inputs:**
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
A: 调整 brainstorm 参数（扩大范围或调整调性）后重新挖掘，不要硬凑。

---

## Stage 2: 文案撰写（sc-writer skill, platform=xhs）

### 详细操作步骤

1. **Outline**：基于 mining 输出，生成大纲
   - 标题、封面 hook、图片系列规划、正文结构
2. **Draft**：生成终稿
   - caption 正文 + 图片内容规格 + 标签
3. **Checkpoint**：用户确认文案

### Checkpoint 清单

- [ ] 标题是否有吸引力
- [ ] 封面 hook 是否抓人
- [ ] 正文结构是否清晰
- [ ] 图片规划是否合理（张数和内容）
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

## Stage 3: 信息图生成（sc-xhs-images skill）

### 详细操作步骤

1. **Style Selection**：基于 mining 推荐的风格+布局
2. **Prompt Assembly**：按 sc-xhs-images 的提示词组装规范组装提示词
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

## Stage 4: 审核（硬闸门）— sc-content-review + sc-compress-image

> 本阶段为**硬闸门**，不通过则无法进入发布阶段。详见 [../hard-gates.md](../hard-gates.md)。

### 4.1 内容审核（sc-content-review）

#### 详细操作步骤

1. **准备审核素材**：收集 `draft/content.md` 和 `images/` 目录下所有图片
2. **调用 sc-content-review**：对文案和图片进行合规性、事实准确性、链接有效性检查
3. **审核结果分级**：
   - `critical`：阻塞问题（违规内容、事实错误、敏感话题），必须修复后重新审核
   - `warning`：建议优化（表述不清、错别字、标签不精准），需用户确认是否修复
   - `pass`：无问题
4. **处理审核结果**：
   - 有 critical → 展示问题列表，引导用户修复，修复后重新审核
   - 只有 warning → 展示问题列表，用户确认后放行
   - 全部 pass → 进入图片压缩
5. **Checkpoint**：用户确认审核通过

#### 内容审核 Checkpoint 清单

- [ ] 无违规/敏感内容
- [ ] 事实性表述准确（无夸大、无虚假宣传）
- [ ] 无错别字和明显语病
- [ ] 标签与内容相关
- [ ] 引导性表述合规（无诱导分享/关注）
- [ ] 引用和链接（如有）有效且合规

#### 输入输出格式

**Inputs:**
```json
{
  "content_file": ".super/{project-title}/draft/content.md",
  "caption_file": ".super/{project-title}/draft/caption.txt",
  "images": [".super/{project-title}/images/01-cover.png", "..."],
  "platform": "xhs"
}
```

**Outputs:**
```json
{
  "review_passed": true,
  "critical_issues": [],
  "warning_issues": [
    {
      "type": "wording",
      "location": "第3段",
      "message": "表述可优化",
      "severity": "warning"
    }
  ],
  "review_report": ".super/{project-title}/review/review-report.md"
}
```

### 4.2 图片压缩（sc-compress-image）

#### 详细操作步骤

1. **收集所有图片**：从 `images/` 目录获取所有 PNG/JPG 图片
2. **调用 sc-compress-image**：将所有图片压缩为 WebP 格式
3. **验证压缩结果**：确认所有图片压缩成功，文件大小合理
4. **更新路径**：将压缩后的 WebP 图片路径更新到状态文件
5. **Checkpoint**：用户确认压缩后图片质量

#### 图片压缩 Checkpoint 清单

- [ ] 所有图片已压缩为 WebP 格式
- [ ] 压缩后图片清晰度可接受
- [ ] 单张图片大小 ≤ 1MB
- [ ] 图片顺序正确
- [ ] 封面图压缩后效果正常

#### 输入输出格式

**Inputs:**
```json
{
  "images": [
    ".super/{project-title}/images/01-cover.png",
    ".super/{project-title}/images/02-xxx.png"
  ],
  "format": "webp",
  "quality": 80
}
```

**Outputs:**
```json
{
  "compressed_images": [
    ".super/{project-title}/review/images/01-cover.webp",
    ".super/{project-title}/review/images/02-xxx.webp"
  ],
  "compression_ratio": "65%",
  "total_size_before": "5.2MB",
  "total_size_after": "1.8MB"
}
```

### 硬闸门规则

- **critical 问题**：必须修复后重新走审核流程，阻塞发布
- **warning 问题**：需用户明确确认（"继续发布"/"先修改"），确认后可放行
- **图片压缩**：所有图片必须成功压缩为 WebP，压缩失败的图片需重新生成或替换
- 闸门通过后，将 `review` 阶段标记为 `completed`，进入 publishing 阶段

### 常见问题与注意事项

**Q: 审核发现 critical 问题怎么办？**
A: 展示具体问题和位置，引导用户修改文案或图片，修改后重新执行审核步骤。不要跳过。

**Q: 图片压缩后质量明显下降怎么办？**
A: 调整 quality 参数重试，或对单张图片单独处理。封面图可以用稍高质量。

**Q: warning 一定要改吗？**
A: 不一定，但必须告知用户，由用户决定是否修改。用户确认"继续"即可放行。

---

## Stage 5: 发布（sc-publish-xhs / xiaohongshu-mcp）

### 发布模式选择

发布阶段有两种模式，在 **pipeline 启动时**由用户选择：

| 模式 | 说明 | 推荐度 | 风险 |
|------|------|--------|------|
| 🛡️ **manual（手动发布）** | 生成发布手册，用户手动在小红书 App / 网页发布 | ⭐⭐⭐⭐⭐ 推荐 | 无风险 |
| ⚡ **auto（自动发布）** | 自动化发布，三级降级：MCP → CDP → 手动 | ⭐⭐ | 有风控风险 |

> **为什么默认推荐手动发布？**
> 小红书对自动化工具检测较严，使用浏览器自动化发布有账号违规风险。内容生产（挖掘→写文→生图→审核）已经能省 80% 的时间，最后一步手动点发布更安全。

### 手动发布模式（manual）

当 `publish_mode: "manual"` 时，发布阶段的流程：

1. 审核通过后，自动生成 **发布手册** `publish/PUBLISH-MANUAL.md`（在项目目录下），包含：
   - 笔记标题
   - 正文文案（带表情符号和话题标签）
   - 压缩后图片列表（WebP 格式，按顺序）
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
│ sc-publish-xhs  │
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
| 2️⃣ 次之 | **sc-publish-xhs CDP** | Chrome 可用且已登录 | Chrome 浏览器自动化脚本 |
| 3️⃣ 兜底 | **手动发布** | 前两种都失败 | 生成 PUBLISH-MANUAL.md，用户手动发 |

**自动检测流程**：
1. 尝试连接 `http://localhost:18060/mcp`
2. 调用 `check_login_status` 检查登录状态
3. 已登录 → 用 MCP 发布
4. 未登录或连接失败 → 降级到 CDP 脚本
5. CDP 也失败 → 生成手动发布手册

#### Level 1: MCP 方式操作说明（推荐）

如果 xiaohongshu-mcp 服务可用，直接调用 `publish_content` 工具：

**MCP 核心工具说明**：

| 工具名 | 说明 |
|--------|------|
| `publish_content` | 发布图文笔记（核心工具） |
| `check_login_status` | 检查当前登录状态 |
| `get_login_qrcode` | 获取登录二维码（返回 Base64 图片） |
| `delete_cookies` | 删除 cookies，重置登录状态 |

**publish_content 参数 Schema**：

```typescript
interface PublishContentParams {
  title: string;           // 笔记标题，建议 20 字以内，必需
  content: string;         // 正文内容，纯文本，最多 1000 字，必需
  images: string[];        // 图片路径数组，本地绝对路径，1-9 张，必需（WebP 格式）
  tags?: string[];         // 话题标签数组，不带 # 号，最多 10 个，可选
  location?: string;       // 位置标签，可选
  is_private?: boolean;    // 是否设为私密，默认 false，可选
  cover_index?: number;    // 封面图片索引（0-based），默认 0，可选
}
```

**返回值**（成功）：

```json
{
  "success": true,
  "post_url": "https://www.xiaohongshu.com/discovery/item/...",
  "note_id": "xxx",
  "title": "笔记标题"
}
```

**发布步骤**：
1. 确认 MCP 服务连接正常
2. 检查登录状态（`check_login_status`）
3. 组装发布参数（标题从 content.md 提取、正文从 caption.txt 读取、图片为压缩后的 WebP 路径、标签）
4. 调用 `publish_content` 发布
5. 返回 `post_url` 和 `note_id`
6. 更新状态文件，记录发布结果

#### Level 2: CDP 方式操作说明（Fallback）

MCP 不可用时，降级到 sc-publish-xhs 的 CDP 脚本：

```bash
cd /path/to/sc-publish-xhs/scripts && npx -y bun xhs-post.ts note \
  --title "笔记标题" \
  --caption-file /path/to/caption.txt \
  --image /path/to/01-cover.webp \
  --image /path/to/02-xxx.webp \
  --tag 标签1 --tag 标签2
```

默认预览模式，不自动发布，用户确认后再加 `--publish`。

#### Level 3: 手动发布（最终兜底）

前两种方式都失败时，生成 `PUBLISH-MANUAL.md` 手动发布手册，包含：
- 标题
- 正文
- 压缩后图片路径列表（WebP）
- 标签
- 发布链接和步骤说明

**手动发布操作指引**：

1. 打开小红书创作者平台（https://creator.xiaohongshu.com）
2. 登录账号
3. 点击「发布笔记」
4. 上传图片（按顺序，使用 review/images/ 下的 WebP 图片）
5. 填写标题
6. 粘贴正文
7. 添加话题标签
8. 预览确认后发布
9. 复制发布链接回填到状态文件

> MCP 安装配置详见 [../xhs-mcp-setup.md](../xhs-mcp-setup.md)。

### 发布确认 Checkpoint 清单

- [ ] 发布模式正确（手动 / 自动）
- [ ] 发布方式选择正确（MCP / CDP / 手动）
- [ ] 标题正确
- [ ] 正文无误
- [ ] 图片为压缩后 WebP 格式，顺序正确
- [ ] 标签齐全
- [ ] 预览效果确认
- [ ] 发布链接已保存

### 输入输出格式

**Inputs:**
```json
{
  "title": "笔记标题",
  "caption_file": ".super/{project-title}/draft/caption.txt",
  "images": [".super/{project-title}/review/images/01-cover.webp", "..."],
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
  "method_used": "mcp",
  "publish_manual": ".super/{project-title}/publish/PUBLISH-MANUAL.md"
}
```

### 常见问题与注意事项

**Q: 为什么默认预览模式？**
A: 发布是不可逆操作，先预览确认后再发布，避免误发。

**Q: MCP 和 CDP 有什么区别？**
A: MCP 是 API 方式，更稳定，不需要打开浏览器；CDP 是浏览器自动化，依赖 Chrome。MCP 优先。

**Q: 手动发布后怎么记录？**
A: 生成 PUBLISH-MANUAL.md，用户手动发完后把链接告诉 AI，AI 更新状态文件。

**Q: 发布失败了怎么办？**
A: 先看错误信息，能重试就重试，不行就降级，都不行就手动。

**Q: 图片上传支持 WebP 吗？**
A: 小红书支持 WebP 格式。如遇问题可保留原始 PNG 作为备选。
