# 微信公众号（wechat）平台阶段详解

本指南详细说明 sc-pipeline 在微信公众号平台下 5 个阶段的操作步骤、Checkpoint 清单、输入输出格式及常见问题。

**阶段流转**：mining → writing → visuals → review（硬闸门）→ publishing

> 注意：公众号发布不需要预先转 HTML，sc-publish-wechat 内部会处理 Markdown 转 HTML 的逻辑。

---

## Stage 1: 内容挖掘（sc-content-mining skill）

### 详细操作步骤

1. **Brainstorm**：用 AskUserQuestion 与用户确认挖掘方向
   - 目标平台（wechat）、受众、调性、范围、核心逻辑
2. **Mine**：扫描内容源，提取适合公众号长文的选题角度
3. **Recommend**：输出选题清单 + 呈现形式建议（含封面图风格建议）
4. **Checkpoint**：用户确认选题和呈现形式

### Checkpoint 清单

- [ ] 选题方向适合公众号长文深度阅读
- [ ] 呈现形式（纯文字/图文混排/信息图穿插）是否确认
- [ ] 目标受众和调性是否明确
- [ ] 内容源范围是否清晰
- [ ] 文章篇幅预期是否确认

### 输入输出格式

**Inputs:**
```json
{
  "brainstorm": {
    "platform": "wechat",
    "audience": "目标受众（如：职场白领/技术从业者/创业者）",
    "tone": "内容调性（如：深度分析/干货教程/观点评论）",
    "scope": "内容源范围",
    "core_logic": "核心理念一句话",
    "length": "预期篇幅（如：3000字/5000字/8000字）"
  }
}
```

**Outputs:**
```json
{
  "mining_output": ".super/{project-title}/mining/topics.md",
  "selected_topic_index": 0
}
```

### 常见问题与注意事项

**Q: 公众号选题和小红书选题有什么不同？**
A: 公众号更适合深度长文、系统性知识、观点分析；小红书偏向短平快、视觉化、清单体。挖掘时侧重不同的"认知错位"模式。

**Q: 内容源可以是什么格式？**
A: 支持 Markdown/TXT/文档等任意文本素材，课程讲稿、专栏文章、系列播客、读书笔记均可。

**Q: 选题太泛怎么办？**
A: 缩小 scope，聚焦一个具体角度深入挖掘，公众号文章贵在深度而非广度。

---

## Stage 2: 文案撰写（sc-writer skill, platform=wechat）

### 详细操作步骤

1. **Outline**：基于 mining 输出，生成公众号长文大纲
   - 文章标题、摘要、章节结构、配图位置规划、金句规划
2. **Draft**：生成完整长文
   - 开头引入、分节论述、案例支撑、结尾总结 + 引导关注
3. **Checkpoint**：用户确认文章

### Checkpoint 清单

- [ ] 标题是否有吸引力和传播性
- [ ] 开头是否能抓住读者
- [ ] 章节结构是否清晰，逻辑是否通顺
- [ ] 内容深度是否符合预期
- [ ] 配图位置规划是否合理
- [ ] 金句/重点标注是否到位
- [ ] 结尾引导是否自然
- [ ] 整体调性符合公众号品牌风格

### 输入输出格式

**Inputs:**
```json
{
  "source": ".super/{project-title}/mining/topics.md",
  "topic_index": 0,
  "platform": "wechat"
}
```

**Outputs:**
```json
{
  "outline": ".super/{project-title}/draft/outline.md",
  "content": ".super/{project-title}/draft/content.md",
  "summary": ".super/{project-title}/draft/summary.txt"
}
```

> `summary.txt` 是文章摘要/导读，用于封面图副标题和发布时的摘要填写。

### 常见问题与注意事项

**Q: 公众号文章一般多长？**
A: 视内容而定，深度文章 3000-8000 字，教程类 2000-5000 字，观点评论 1500-3000 字。

**Q: 需要自己排版吗？**
A: 不需要手动排版。review 阶段会调用 sc-format-markdown 自动格式化，输出公众号友好的排版。

**Q: 配图位置怎么规划？**
A: 在大纲中标记每个配图位置的用途（封面图/章节分隔图/内容示意图/数据图表），visuals 阶段按规划生成。

---

## Stage 3: 视觉素材生成（sc-cover-image + sc-article-illustrator）

### 详细操作步骤

1. **封面图生成（sc-cover-image）**：
   - 根据文章主题和调性，生成公众号封面图
   - 尺寸：2.35:1 宽屏（900x383 或 1280x545）
   - 包含：文章标题 + 视觉元素 + 品牌调性
   - 用户确认封面图
2. **文章配图生成（sc-article-illustrator）**：
   - 基于 draft/content.md 和大纲中的配图规划
   - 分析文章结构，识别需要配图的位置
   - 为每个配图位置生成对应图片
   - 图片类型：概念示意图、数据图表、流程图、场景图等
   - 用户确认配图
3. **Checkpoint**：用户确认所有视觉素材

### Checkpoint 清单

- [ ] 封面图尺寸正确（2.35:1）
- [ ] 封面图标题文字清晰可读
- [ ] 封面图风格符合品牌调性
- [ ] 文章配图数量合适（每 800-1500 字一张图）
- [ ] 配图与上下文内容匹配
- [ ] 配图风格统一
- [ ] 所有图片清晰度达标

### 输入输出格式

**Inputs:**
```json
{
  "content_file": ".super/{project-title}/draft/content.md",
  "outline_file": ".super/{project-title}/draft/outline.md",
  "cover_style": "cinematic | minimal | bold | ...",
  "article_style": "illustration | chart | photo | ..."
}
```

**Outputs:**
```json
{
  "cover_image": ".super/{project-title}/visuals/cover.webp",
  "illustrations": [
    {
      "position": "section-1",
      "path": ".super/{project-title}/visuals/fig-01.webp",
      "caption": "图1：xxx示意图",
      "alt": "xxx"
    },
    {
      "position": "section-3",
      "path": ".super/{project-title}/visuals/fig-02.webp",
      "caption": "图2：xxx流程图",
      "alt": "xxx"
    }
  ]
}
```

### 常见问题与注意事项

**Q: 公众号封面图比例是多少？**
A: 公众号封面图推荐 2.35:1（宽屏），次条 1:1。sc-cover-image 默认生成宽屏封面。

**Q: 文章里一般放几张配图？**
A: 根据文章长度，通常每 800-1500 字配一张图，3000 字文章 2-4 张配图即可。封面图不算在内。

**Q: 配图可以用数据图表吗？**
A: 可以，sc-article-illustrator 支持多种配图类型，包括图表、流程图、概念图、场景图等。

**Q: 封面图文字看不清怎么办？**
A: 调整 sc-cover-image 的 prompt，强调文字可读性，或换用更大字号/更强对比度的风格。

---

## Stage 4: 审核（硬闸门）— sc-format-markdown + sc-content-review + sc-compress-image

> 本阶段为**硬闸门**，不通过则无法进入发布阶段。详见 [../hard-gates.md](../hard-gates.md)。

审核阶段按顺序执行三个步骤：排版格式化 → 内容审核 → 图片压缩。任何一步不通过都需要修复后重新审核。

### 4.1 排版格式化（sc-format-markdown）

#### 详细操作步骤

1. **准备素材**：收集 `draft/content.md` 和 `visuals/` 下的配图信息
2. **调用 sc-format-markdown**：
   - 将 Markdown 转换为公众号友好的排版格式
   - 自动插入配图（按 visuals 阶段规划的位置）
   - 添加图注（caption）
   - 应用公众号排版规范（字号、行距、段落间距、引用样式等）
3. **输出格式化文件**：保存到 `review/formatted.md`
4. **Checkpoint**：用户确认排版效果

#### 排版格式化 Checkpoint 清单

- [ ] 标题层级清晰（H1/H2/H3）
- [ ] 段落间距适中，阅读体验良好
- [ ] 引用块/代码块/列表格式正确
- [ ] 配图位置正确，图注完整
- [ ] 重点内容（加粗/高亮）标注恰当
- [ ] 文末引导关注/阅读原文等固定模块已添加
- [ ] 无排版乱码或格式错误

#### 输入输出格式

**Inputs:**
```json
{
  "content_file": ".super/{project-title}/draft/content.md",
  "illustrations": [
    {
      "position": "section-1",
      "path": ".super/{project-title}/visuals/fig-01.webp",
      "caption": "图1：xxx示意图"
    }
  ],
  "platform": "wechat"
}
```

**Outputs:**
```json
{
  "formatted_content": ".super/{project-title}/review/formatted.md",
  "format_warnings": []
}
```

### 4.2 内容审核（sc-content-review）

#### 详细操作步骤

1. **准备审核素材**：收集格式化后的 `review/formatted.md` 和所有图片
2. **调用 sc-content-review**：重点检查公众号红线规则
   - 政治敏感内容
   - 诱导分享/关注（"不转不是中国人"类话术）
   - 虚假宣传/夸大事实
   - 外链/二维码合规性
   - 原创声明相关
   - 事实准确性
3. **审核结果分级**：
   - `critical`：阻塞问题（违规内容、敏感话题、虚假信息），必须修复
   - `warning`：建议优化（错别字、表述不清、排版细节），需用户确认
   - `pass`：无问题
4. **处理审核结果**：
   - 有 critical → 展示问题，修复后重新从排版格式化开始
   - 只有 warning → 展示问题，用户确认后放行
   - 全部 pass → 进入图片压缩
5. **Checkpoint**：用户确认审核通过

#### 公众号内容审核重点 Checkpoint 清单

- [ ] 无政治敏感/违规内容
- [ ] 无诱导分享/关注的违规话术
- [ ] 无虚假宣传或夸大表述
- [ ] 外链/二维码符合公众号规范
- [ ] 事实性表述准确，数据有出处
- [ ] 无错别字和明显语病
- [ ] 原创声明/引用标注合规
- [ ] 文末无违规导流

#### 输入输出格式

**Inputs:**
```json
{
  "content_file": ".super/{project-title}/review/formatted.md",
  "cover_image": ".super/{project-title}/visuals/cover.webp",
  "illustrations": [".super/{project-title}/visuals/fig-01.webp", "..."],
  "platform": "wechat"
}
```

**Outputs:**
```json
{
  "review_passed": true,
  "critical_issues": [],
  "warning_issues": [],
  "review_report": ".super/{project-title}/review/review-report.md"
}
```

### 4.3 图片压缩（sc-compress-image）

#### 详细操作步骤

1. **收集所有图片**：封面图 + 所有文章配图
2. **调用 sc-compress-image**：将所有图片压缩为 WebP 格式
3. **公众号图片特殊要求**：
   - 封面图建议 ≤ 2MB
   - 正文配图建议 ≤ 1MB
   - 所有图片宽度建议 ≤ 1080px
4. **验证压缩结果**：确认清晰度可接受
5. **更新路径**：将压缩后图片路径更新到状态文件
6. **Checkpoint**：用户确认压缩后图片质量

#### 图片压缩 Checkpoint 清单

- [ ] 封面图已压缩，清晰度可接受
- [ ] 所有正文配图已压缩为 WebP
- [ ] 单张图片大小符合要求
- [ ] 图片尺寸适合公众号显示
- [ ] 图中文字清晰可读

#### 输入输出格式

**Inputs:**
```json
{
  "images": [
    ".super/{project-title}/visuals/cover.webp",
    ".super/{project-title}/visuals/fig-01.webp"
  ],
  "format": "webp",
  "quality": 82,
  "max_width": 1080
}
```

**Outputs:**
```json
{
  "compressed_images": {
    "cover": ".super/{project-title}/review/images/cover.webp",
    "illustrations": [
      ".super/{project-title}/review/images/fig-01.webp"
    ]
  },
  "total_size_before": "8.5MB",
  "total_size_after": "2.1MB"
}
```

### 硬闸门规则

- **排版问题**：排版格式化失败或有 format_warnings 需修复后重新排版
- **critical 问题**：必须修复后重新走完整审核流程（排版→审核→压缩），阻塞发布
- **warning 问题**：需用户明确确认，确认后可放行
- **图片压缩**：所有图片必须成功压缩，压缩失败需重新生成或替换
- 闸门通过后，将 `review` 阶段标记为 `completed`，进入 publishing 阶段

### 常见问题与注意事项

**Q: 公众号审核比小红书更严吗？**
A: 公众号对政治敏感、诱导分享、虚假宣传的审核更严格，且有原创保护机制。内容审核时需特别注意公众号平台规则。

**Q: 排版后图片插入位置不对怎么办？**
A: 调整 formatted.md 中图片标记的位置，或回到 writing 阶段调整大纲中的配图规划。

**Q: 格式化后还能改文字吗？**
A: 如果是文字修改，需要回到 writing 阶段修改 content.md，然后重新走 review 阶段。如果只是排版调整，可以直接在 formatted.md 上微调。

---

## Stage 5: 发布（sc-publish-wechat）

### 发布方式

sc-publish-wechat 支持两种发布方式：

| 方式 | 说明 | 推荐度 |
|------|------|--------|
| 🛡️ **草稿箱模式** | 推送到公众号草稿箱，用户在公众号后台预览后手动群发 | ⭐⭐⭐⭐⭐ 推荐 |
| ⚡ **直接群发** | 直接群发发布（需管理员扫码确认） | ⭐⭐⭐ |

> **推荐草稿箱模式**：公众号群发不可逆，先推送到草稿箱预览确认再群发更安全。

### 三级降级策略

当 `publish_mode: "auto"` 时，采用**三级降级策略**，优先使用最稳定的方式：

```
┌─────────────────┐
│  Level 1: API   │  ← 优先（最稳定）
│  wechat-api.ts  │
└────────┬────────┘
         │ 不可用/失败
         ▼
┌─────────────────┐
│  Level 2: Browser│  ← Fallback
│  wechat-browser │
└────────┬────────┘
         │ 不可用/失败
         ▼
┌─────────────────┐
│ Level 3: Manual │  ← 最终兜底
│  手动发布手册    │
└─────────────────┘
```

#### 方法选择逻辑

| 优先级 | 方式 | 触发条件 | 说明 |
|--------|------|----------|------|
| 1️⃣ 最高 | **wechat-api** | API 凭据可用（app_id/app_secret） | API 草稿箱模式，最稳定 |
| 2️⃣ 次之 | **wechat-browser** | Chrome 可用且已登录 | Chrome 浏览器自动化脚本 |
| 3️⃣ 兜底 | **手动发布** | 前两种都失败 | 生成 PUBLISH-MANUAL.md，用户手动发 |

**手动兜底（Level 3）**：

当 API 和 Browser 都失败时，自动生成 **发布手册** `publish/PUBLISH-MANUAL.md`（在项目目录下），包含：
- 文章标题
- 排版好的正文内容（HTML 或 Markdown）
- 封面图和配图列表
- 文章摘要
- 发布步骤指引（登录公众号后台 → 新建图文 → 粘贴内容 → 上传图片 → 发布）

> **注意**：PUBLISH-MANUAL.md 由 AI 助手按此约定在 pipeline 执行时生成，不需要单独脚本。发布脚本失败时会在错误输出中提示"请参考 PUBLISH-MANUAL.md 手动发布"。

### 详细操作步骤

1. **准备发布素材**：
   - 从 `review/formatted.md` 读取排版好的文章内容（Markdown 格式）
   - 从 `review/images/` 获取压缩后的封面图和配图
   - 从 `draft/summary.txt` 读取文章摘要
2. **调用 sc-publish-wechat**：
   - 传入 .md 文件路径，sc-publish-wechat 内部处理 Markdown → HTML 转换
   - 上传封面图和配图到公众号素材库
   - 创建草稿或直接群发
3. **确认发布结果**：
   - 草稿模式：返回草稿 ID，提示用户去公众号后台预览群发
   - 直接群发：返回群发结果和文章链接
4. **Checkpoint**：用户确认发布成功

### 发布确认 Checkpoint 清单

- [ ] 文章标题正确
- [ ] 封面图已设置
- [ ] 摘要填写完整
- [ ] 正文排版正确
- [ ] 配图显示正常
- [ ] 原创声明（如需）已设置
- [ ] 发布方式确认（草稿/群发）
- [ ] 预览效果确认
- [ ] 发布链接/状态已记录

### 输入输出格式

**Inputs:**
```json
{
  "content_file": ".super/{project-title}/review/formatted.md",
  "cover_image": ".super/{project-title}/review/images/cover.webp",
  "summary": ".super/{project-title}/draft/summary.txt",
  "images_dir": ".super/{project-title}/review/images/",
  "publish_action": "draft | live",
  "original": true,
  "author": "作者名"
}
```

> 注意：直接传 `.md` 文件路径给 sc-publish-wechat，不需要预先转 HTML。

**Outputs（草稿模式）:**
```json
{
  "published": false,
  "draft_id": "草稿ID",
  "media_id": "素材ID",
  "preview_url": "预览链接（如有）",
  "method_used": "api",
  "status": "draft_created"
}
```

**Outputs（群发模式）:**
```json
{
  "published": true,
  "post_url": "https://mp.weixin.qq.com/s/...",
  "msg_id": "群发消息ID",
  "method_used": "api",
  "status": "published"
}
```

**method_used 取值说明**：

| 值 | 说明 | 对应脚本 |
|----|------|----------|
| `api` | 使用 wechat-api.ts（API 草稿箱/群发） | wechat-api.ts |
| `browser` | 使用浏览器自动化（wechat-browser.ts 或 wechat-article.ts） | wechat-browser.ts / wechat-article.ts |
| `manual` | 手动发布兜底（PUBLISH-MANUAL.md） | 由 AI 助手生成手册 |

> **注意**：`method_used` 字段由 sc-pipeline 在编排时写入 state.json，发布脚本本身不维护此字段。

### 常见问题与注意事项

**Q: 需要先把 Markdown 转成 HTML 吗？**
A: 不需要。sc-publish-wechat 内部会处理 Markdown 到公众号 HTML 的转换，直接传 .md 文件即可。

**Q: 图片怎么上传到公众号？**
A: sc-publish-wechat 会自动调用公众号接口上传图片到素材库，并替换文章中的图片路径。

**Q: 草稿箱模式怎么群发？**
A: 登录公众号后台（mp.weixin.qq.com），在「素材管理」或「草稿箱」中找到推送的草稿，预览确认后点击「群发」，管理员扫码确认即可。

**Q: 发布失败怎么办？**
A: 检查错误信息：
- AppID/AppSecret 配置是否正确
- IP 是否在白名单中
- access_token 是否过期（会自动刷新）
- 图片大小是否超限
- 内容是否触发审核拦截

**Q: 可以定时发布吗？**
A: 公众号后台支持定时群发，推送到草稿箱后在后台设置定时发布即可。
