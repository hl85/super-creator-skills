# MCP Integration — Xiaohongshu MCP

## Overview

xiaohongshu-mcp 是一个本地运行的 MCP（Model Context Protocol）服务，为小红书提供稳定、可靠的 API 接口。相比 Chrome CDP 自动化，MCP 方式不受页面 DOM 结构变化影响，发布更稳定。

默认服务地址：`http://localhost:18060/mcp`

---

## 完整操作步骤（MCP 方式）

### 前置条件

1. xiaohongshu-mcp 服务已安装并启动
2. 小红书账号已扫码登录

### 步骤 1：连接 MCP 服务

在 MCP 客户端配置中添加服务地址：
- 默认地址：`http://localhost:18060/mcp`
- 可通过环境变量 `XIAOHONGSHU_MCP_URL` 覆盖

### 步骤 2：检查登录状态

调用 `check_login_status` 工具确认登录状态：
```
check_login_status()
```

返回「已登录」则继续，否则调用 `get_login_qrcode` 获取二维码扫码登录。

### 步骤 3：发布笔记

调用 `publish_content` 工具发布：
```
publish_content(
  title: "笔记标题",
  content: "正文内容",
  images: ["/path/to/img1.png", "/path/to/img2.png"],
  tags: ["标签1", "标签2"]
)
```

### 步骤 4：验证结果

发布成功后保存 `post_url`，可在浏览器中打开验证。

---

## MCP 工具列表（13 个）

xiaohongshu-mcp 共提供 **13 个工具**，涵盖发布、账号管理、内容管理、互动等功能。

> ✅ 以下工具名已通过实际调用验证

### 核心发布工具

| 工具名 | 说明 | 验证状态 |
|--------|------|---------|
| `publish_content` | 发布图文笔记（核心发布工具） | ✅ 已验证 |
| `publish_with_video` | 发布视频笔记（本地单个视频文件） | - |
| `check_login_status` | 检查当前登录状态 | ✅ 已验证 |

### 账号管理工具

| 工具名 | 说明 | 验证状态 |
|--------|------|---------|
| `get_login_qrcode` | 获取登录二维码（返回 Base64 图片） | ✅ 已验证 |
| `delete_cookies` | 删除 cookies，重置登录状态 | - |

### 内容浏览工具

| 工具名 | 说明 | 验证状态 |
|--------|------|---------|
| `list_feeds` | 获取首页 Feeds 列表 | - |
| `search_feeds` | 搜索小红书内容（需登录） | - |
| `get_feed_detail` | 获取笔记详情（含互动数据和评论） | - |
| `user_profile` | 获取用户主页信息及笔记（需 user_id + xsec_token） | ⚠️ 需参数 |

### 互动工具

| 工具名 | 说明 | 验证状态 |
|--------|------|---------|
| `post_comment_to_feed` | 发表评论到笔记 | - |
| `reply_comment_in_feed` | 回复笔记下的指定评论 | - |
| `like_feed` | 为笔记点赞或取消点赞 | - |
| `favorite_feed` | 收藏笔记或取消收藏 | - |

> 注：具体工具可用性以实际 MCP 服务版本为准，连接后可通过 `tools/list` 查看完整列表。

---

## publish_content 完整参数 Schema

### 参数

```typescript
interface PublishContentParams {
  title: string;           // 笔记标题，建议 20 字以内，必需
  content: string;         // 正文内容，纯文本，最多 1000 字，必需
  images: string[];        // 图片路径数组，本地绝对路径，1-9 张，必需
  tags?: string[];         // 话题标签数组，不带 # 号，最多 10 个，可选
  location?: string;       // 位置标签，可选
  is_private?: boolean;    // 是否设为私密，默认 false，可选
  cover_index?: number;    // 封面图片索引（0-based），默认 0，可选
}
```

### 参数详细说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 笔记标题，建议 20 字以内 |
| `content` | string | ✅ | 正文内容，支持纯文本，最多 1000 字 |
| `images` | string[] | ✅ | 图片路径数组，本地绝对路径，1-9 张，支持 JPG/PNG/WebP |
| `tags` | string[] | ❌ | 话题标签数组，不带 `#` 号，最多 10 个 |
| `location` | string | ❌ | 位置标签，如"北京"、"上海" |
| `is_private` | boolean | ❌ | 是否设为仅自己可见，默认 false |
| `cover_index` | number | ❌ | 封面图片索引（从 0 开始），默认 0（第一张图） |

### 返回值

成功：
```json
{
  "success": true,
  "post_url": "https://www.xiaohongshu.com/discovery/item/...",
  "note_id": "xxx",
  "title": "笔记标题"
}
```

失败：
```json
{
  "success": false,
  "error": "错误描述信息",
  "error_code": "ERROR_CODE"
}
```

### 使用示例

```
publish_content(
  title: "面试不是考技术，是赌潜力",
  content: "很多人以为面试是在考技术能力，但实际上面试官更看重的是你的潜力和成长空间。\n\n#面试 #求职 #职场",
  images: [
    "/Users/xxx/.course/xhs-interview/images/01-cover.png",
    "/Users/xxx/.course/xhs-interview/images/02-content.png"
  ],
  tags: ["面试", "求职", "职场"],
  location: "北京",
  cover_index: 0
)
```

---

## 连接配置

### 默认地址

```
http://localhost:18060/mcp
```

### 环境变量覆盖

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `XIAOHONGSHU_MCP_URL` | MCP 服务地址 | `http://localhost:18060/mcp` |

---

## MCP vs CDP 对比

| 维度 | xiaohongshu-mcp | Chrome CDP 脚本 |
|------|-----------------|-----------------|
| **稳定性** | ⭐⭐⭐⭐⭐ 高，基于 API 接口 | ⭐⭐⭐ 中，依赖 DOM 结构 |
| **发布速度** | ⭐⭐⭐⭐⭐ 快，直接 API 调用 | ⭐⭐⭐ 慢，需模拟浏览器操作 |
| **可靠性** | ⭐⭐⭐⭐⭐ 不受前端改版影响 | ⭐⭐ 可能因 DOM 变化失效 |
| **依赖** | 需要本地 MCP 服务运行 | 需要 Chrome 浏览器 |
| **登录方式** | 二维码扫码登录 | Chrome Profile 持久化 |
| **调试难度** | 低，错误信息明确 | 高，需要排查 DOM 选择器 |
| **适用场景** | 日常批量发布、稳定优先 | MCP 不可用时的 fallback |

---

## 故障排查

### Top 1：MCP 连不上

**症状**：调用工具超时或返回连接错误

**排查步骤**：
1. **检查服务是否启动**
   ```bash
   lsof -i :18060
   ```
2. 确认地址是否为 `http://localhost:18060/mcp`
3. 检查环境变量 `XIAOHONGSHU_MCP_URL` 是否被错误覆盖
4. 重启 MCP 服务
5. 检查防火墙/网络是否拦截本地连接

### Top 2：登录态失效

**症状**：返回未登录错误或发布失败

**解决方法**：
1. 调用 `check_login_status` 确认登录状态
2. 调用 `get_login_qrcode` 重新扫码登录
3. 登录成功后重试发布

### Top 3：图片上传失败

**症状**：图片上传超时或失败

**排查步骤**：
1. 检查图片路径是否为**绝对路径**
2. 检查图片格式是否支持（JPG/PNG/WebP）
3. 检查图片大小是否超限（单张 10MB 以内）
4. 检查图片数量是否超限（最多 9 张）

---

### 发布后笔记不见了

**症状**：发布成功但在个人主页找不到

**可能原因**：
1. 笔记正在审核中，审核通过后才会公开显示
2. 笔记违反社区规范被限流或隐藏
3. 设置了私密发布（`is_private: true`）

**解决方法**：
1. 等待几分钟后刷新查看
2. 调用 `get_note_detail` 查看笔记状态
3. 检查是否误设为私密

### 标签不生效

**症状**：发布后没有话题标签

**排查步骤**：
1. 检查 `tags` 参数是否传入（不带 `#` 号）
2. 检查标签数量是否超过 10 个
3. 确认标签名称是否正确（可在小红书 App 搜索验证）

### 接口调用频率限制

**症状**：返回 rate limit 错误

**说明**：为防止账号被限流，MCP 服务内置了频率限制

**建议**：
1. 两篇笔记发布间隔至少 5 分钟
2. 单日发布不超过 5 篇
3. 批量发布时增加延时

### 如何 Fallback 到 CDP

当 MCP 不可用时，自动降级流程：

```
MCP 连接失败
    │
    ▼
记录错误日志
    │
    ▼
切换到 CDP 脚本方式
    │
    ▼
CDP 也失败
    │
    ▼
生成手动发布手册 (PUBLISH-MANUAL.md)
```

**手动强制使用 CDP**：
- 直接调用 CDP 脚本，跳过 MCP 检测
- 或暂时停止 MCP 服务，触发自动降级

---

## 最佳实践

1. **优先用 MCP**：只要 MCP 服务可用，始终优先使用
2. **检查登录态**：发布前先调用 `check_login_status` 确认登录状态
3. **绝对路径**：`images` 参数必须使用本地绝对路径
4. **错误重试**：遇到网络错误可重试 1-2 次，再考虑降级
5. **发布后验证**：发布成功后在小红书 App 中确认笔记可见
6. **控制频率**：避免短时间内大量发布，防止账号受限
7. **保存发布记录**：记录发布时间、标题、标签，方便后续追踪

---

## 实际验证报告

> 验证时间：2026-07-16
> 验证环境：macOS arm64 + xiaohongshu-mcp v2026.06.12

### 已验证功能

| 功能 | 工具名 | 状态 | 说明 |
|------|--------|------|------|
| 服务健康检查 | `GET /health` | ✅ 通过 | 返回 service: healthy |
| MCP 会话初始化 | `initialize` | ✅ 通过 | 支持 MCP over HTTP，需携带 Mcp-Session-Id |
| 获取登录二维码 | `get_login_qrcode` | ✅ 通过 | 返回 text + image 两种 content |
| 检查登录状态 | `check_login_status` | ✅ 通过 | 返回「已登录」或「未登录」 |
| 发布图文笔记 | `publish_content` | ✅ 通过 | title + content + images + tags 均生效 |

### 未验证 / 需注意

| 功能 | 工具名 | 状态 | 说明 |
|------|--------|------|------|
| 用户主页 | `user_profile` | ⚠️ 需参数 | 需要传入 `user_id` 和 `xsec_token` |
| 视频发布 | `publish_with_video` | ❌ 未测 | 暂无测试视频 |
| 搜索/评论/点赞/收藏 | 多个工具 | ❌ 未测 | 需进一步验证 |

### publish_content 验证结果

- **标题**：✅ 正常显示
- **正文**：✅ 换行、表情（如有）正常
- **图片**：✅ 单图上传成功，PNG 格式支持
- **标签**：✅ tags 参数传入后自动添加话题标签
- **返回值**：返回成功状态，但不包含 post_url 或 note_id（需自行在 App 中查看）

### 已知限制

1. `publish_content` 成功返回不包含笔记链接，需在小红书 App 中手动查看
2. `user_profile` 需要额外的 user_id 和 xsec_token 参数，不能直接获取当前登录用户主页
3. 频率限制未明确，建议保守使用（单日不超过 5 篇，间隔 5 分钟以上）
