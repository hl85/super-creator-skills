# 小红书 MCP 发布指南

> 本文档基于 sc-post-to-xhs skill 的 `references/mcp-integration.md` 精简，只保留 sc-xhs-pipeline 需要了解的 MCP 配置和使用方法。完整信息请参考 sc-post-to-xhs skill 的官方文档。

---

## 1. 概述

xiaohongshu-mcp 是一个本地运行的 MCP（Model Context Protocol）服务，为小红书提供稳定、可靠的 API 接口。相比 Chrome CDP 自动化，MCP 方式不受页面 DOM 结构变化影响，发布更稳定。

默认服务地址：`http://localhost:18060/mcp`

---

## 2. 快速上手

### 2.1 前置条件

1. xiaohongshu-mcp 服务已安装并启动
2. 小红书账号已扫码登录

### 2.2 发布四步走

1. **连接 MCP 服务**：在 MCP 客户端配置服务地址（默认 `http://localhost:18060/mcp`）
2. **检查登录状态**：调用 `check_login_status` 确认已登录
3. **发布笔记**：调用 `publish_content` 发布图文
4. **验证结果**：保存返回的 `post_url`，在浏览器中验证

---

## 3. 核心工具

### 3.1 publish_content（发布图文笔记）

**参数 Schema**：

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

**返回值**（成功）：

```json
{
  "success": true,
  "post_url": "https://www.xiaohongshu.com/discovery/item/...",
  "note_id": "xxx",
  "title": "笔记标题"
}
```

**使用示例**：

```
publish_content(
  title: "面试不是考技术，是赌潜力",
  content: "很多人以为面试是在考技术能力...",
  images: ["/path/to/01-cover.png", "/path/to/02-content.png"],
  tags: ["面试", "求职", "职场"],
  location: "北京",
  cover_index: 0
)
```

### 3.2 其他常用工具

| 工具名 | 说明 |
|--------|------|
| `check_login_status` | 检查当前登录状态 |
| `get_login_qrcode` | 获取登录二维码（返回 Base64 图片） |
| `delete_cookies` | 删除 cookies，重置登录状态 |
| `publish_with_video` | 发布视频笔记 |

> 注：完整工具列表（共 13 个）及详细说明，请参考 sc-post-to-xhs skill 的 mcp-integration.md 文档。

---

## 4. 连接配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| 服务地址 | `http://localhost:18060/mcp` | 本地 MCP 服务地址 |
| 环境变量 | `XIAOHONGSHU_MCP_URL` | 可覆盖默认地址 |

---

## 5. MCP vs CDP 对比

| 维度 | MCP 方式 | CDP 浏览器方式 |
|------|---------|---------------|
| 稳定性 | 高，基于 API 接口 | 中，依赖 DOM 结构 |
| 发布速度 | 快，直接 API 调用 | 慢，模拟浏览器操作 |
| 可靠性 | 不受前端改版影响 | 可能因 DOM 变化失效 |
| 依赖 | 需要本地 MCP 服务 | 需要 Chrome 浏览器 |
| 登录方式 | 二维码扫码登录 | Chrome Profile 持久化 |

**推荐策略**：优先用 MCP，MCP 不可用时自动降级到 CDP。

---

## 6. 常见问题排查

### MCP 连不上

1. 检查服务是否启动：`lsof -i :18060`
2. 确认地址是否正确
3. 检查环境变量 `XIAOHONGSHU_MCP_URL`
4. 重启 MCP 服务

### 登录态失效

1. 调用 `check_login_status` 确认
2. 调用 `get_login_qrcode` 重新扫码登录

### 图片上传失败

1. 检查图片路径是否为**绝对路径**
2. 检查格式是否支持（JPG/PNG/WebP）
3. 检查单张大小 ≤ 10MB
4. 检查数量 ≤ 9 张

### 频率限制建议

- 两篇笔记发布间隔至少 5 分钟
- 单日发布不超过 5 篇
- 批量发布时增加延时

---

## 7. 最佳实践

1. 优先用 MCP：只要服务可用，始终优先使用
2. 检查登录态：发布前先确认登录状态
3. 绝对路径：`images` 参数必须使用本地绝对路径
4. 错误重试：遇到网络错误可重试 1-2 次，再考虑降级
5. 控制频率：避免短时间内大量发布
6. 保存发布记录：记录发布时间、标题、标签
