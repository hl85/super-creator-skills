# MCP Setup — xiaohongshu-mcp 安装配置指南

本指南介绍如何安装、配置 xiaohongshu-mcp 服务，以及如何与 xhs-pipeline 集成。

---

## 1. 快速安装

### 二进制下载（推荐）

xiaohongshu-mcp 提供预编译的二进制文件，开箱即用。

**下载地址**：从官方发布页下载对应平台的二进制文件

| 平台 | 文件名 |
|------|--------|
| macOS (Apple Silicon) | `xiaohongshu-mcp-darwin-arm64` |
| macOS (Intel) | `xiaohongshu-mcp-darwin-amd64` |
| Linux (amd64) | `xiaohongshu-mcp-linux-amd64` |
| Windows (amd64) | `xiaohongshu-mcp-windows-amd64.exe` |

### 安装步骤

```bash
# 1. 下载二进制文件（以 macOS arm64 为例）
curl -L -o xiaohongshu-mcp "下载链接"

# 2. 添加执行权限
chmod +x xiaohongshu-mcp

# 3. 移动到 PATH 目录（可选）
sudo mv xiaohongshu-mcp /usr/local/bin/

# 4. 验证安装
xiaohongshu-mcp --version
```

### 其他安装方式

如有源码或 npm 包，也可通过以下方式安装：
- 源码编译：`go build` 或对应语言的编译命令
- npm：`npm install -g xiaohongshu-mcp`（如提供）

---

## 2. 启动服务

### 默认启动

```bash
# 默认监听 18060 端口
xiaohongshu-mcp server
```

### 自定义配置

```bash
# 指定端口
xiaohongshu-mcp server --port 18060

# 指定配置文件
xiaohongshu-mcp server --config ~/.xiaohongshu-mcp/config.json

# 后台运行（macOS/Linux）
nohup xiaohongshu-mcp server > ~/.xiaohongshu-mcp/server.log 2>&1 &
```

### 服务参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--port` | 监听端口 | `18060` |
| `--host` | 监听地址 | `localhost` |
| `--config` | 配置文件路径 | `~/.xiaohongshu-mcp/config.json` |
| `--log-level` | 日志级别 | `info` |

### 服务地址

启动成功后，MCP 服务地址为：

```
http://localhost:18060/mcp
```

---

## 3. 登录步骤

首次使用需要登录小红书账号。

### 方式一：CLI 交互式登录

```bash
# 启动登录流程
xiaohongshu-mcp login
```

1. 命令行显示二维码
2. 用小红书 App 扫描二维码
3. 手机上确认登录
4. 登录成功，会话自动保存

### 方式二：MCP 工具登录

连接 MCP 后，使用登录相关工具：
1. 调用 `get_login_qrcode` 获取二维码
2. 扫码登录
3. 调用 `check_login` 确认登录状态

### 登录态保存

登录成功后，会话信息保存在：
- macOS: `~/Library/Application Support/xiaohongshu-mcp/`
- Linux: `~/.xiaohongshu-mcp/`
- Windows: `%APPDATA%/xiaohongshu-mcp/`

---

## 4. 验证方法

### 检查服务是否运行

```bash
# 检查端口监听
lsof -i :18060

# 或使用 curl 测试健康检查端点（如有）
curl http://localhost:18060/health
```

### 通过 MCP 客户端验证

1. 在 MCP 客户端（如 Claude Desktop、Trae 等）添加服务配置
2. 连接到 `http://localhost:18060/mcp`
3. 查看可用工具列表，应该能看到 13 个工具
4. 调用 `check_login` 确认登录状态

### 验证发布功能

```
# 调用 check_login 检查登录
check_login()

# 返回 true 说明登录正常
# 返回 false 则需要先登录
```

---

## 5. 与 xhs-pipeline 集成配置

### 环境变量配置

xhs-pipeline 通过以下环境变量识别 MCP 服务：

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `XIAOHONGSHU_MCP_URL` | MCP 服务地址 | `http://localhost:18060/mcp` |

```bash
# 在 .zshrc / .bashrc 中设置（可选）
export XIAOHONGSHU_MCP_URL="http://localhost:18060/mcp"
```

### 发布三级降级策略详解

> ⚠️ **重要提醒**：自动发布（MCP / CDP）本质上都是浏览器自动化，有被小红书风控检测到的风险。推荐使用**手动发布模式**，内容生产自动化 + 手动发布最安全。
>
> 仅在你能接受账号风险的情况下使用自动发布模式。

xhs-pipeline 的 Stage 4（发布阶段）有两种模式，在 pipeline 启动时选择：
- **manual（手动发布，推荐）**：生成发布手册，用户手动发布
- **auto（自动发布）**：MCP → CDP → 手动 三级降级

自动发布模式下的三级降级策略：

#### 三级降级判断逻辑

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

#### 每一级的触发条件

| 优先级 | 方式 | 触发条件 | 说明 |
|--------|------|----------|------|
| 1️⃣ 最高 | **xiaohongshu-mcp** | MCP 服务运行且已登录 | 本地 MCP 服务，API 方式发布，最稳定 |
| 2️⃣ 次之 | **post-to-xhs CDP** | Chrome 可用且已登录 | Chrome 浏览器自动化脚本 |
| 3️⃣ 兜底 | **手动发布** | 前两种都失败 | 生成 PUBLISH-MANUAL.md，用户手动发 |

**自动检测流程**：
1. 尝试连接 `http://localhost:18060/mcp`
2. 调用 `check_login` 检查登录状态
3. 已登录 → 用 MCP 发布
4. 未登录或连接失败 → 降级到 CDP 脚本
5. CDP 也失败 → 生成手动发布手册

#### Level 1: MCP 发布操作流程

如果 xiaohongshu-mcp 服务可用，直接调用 `publish_content` 工具：

**输入准备**：
- 从 `content.md` 提取标题
- 从 `caption.txt` 读取正文内容
- 从 `images/` 目录获取所有图片（绝对路径）
- 从内容中提取或使用默认标签

**发布步骤**：
1. 确认 MCP 服务连接正常
2. 检查登录状态（`check_login`）
3. 组装发布参数（标题、正文、图片路径、标签）
4. 调用 `publish_content` 发布
5. 返回 `post_url` 和 `note_id`
6. 更新状态文件，记录发布结果

#### Level 2: CDP 发布操作流程

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

#### Level 3: 手动发布操作指引

前两种方式都失败时，生成 `PUBLISH-MANUAL.md` 手动发布手册，用户按以下步骤操作：

1. 打开小红书创作者平台（https://creator.xiaohongshu.com）
2. 登录账号
3. 点击「发布笔记」
4. 上传图片（按顺序）
5. 填写标题
6. 粘贴正文
7. 添加话题标签
8. 预览确认后发布
9. 复制发布链接告诉 AI，AI 更新状态文件

### Pipeline 中的使用流程

xhs-pipeline 的 Stage 4（发布阶段）会自动检测并使用 MCP：

```
Stage 3 完成 → 进入 Stage 4
                    │
                    ▼
          检测 MCP 服务是否可用
                    │
           ┌────────┴────────┐
           │                 │
         可用              不可用
           │                 │
           ▼                 ▼
    检查登录状态       降级到 CDP 脚本
           │
     ┌─────┴─────┐
     │           │
   已登录      未登录
     │           │
     ▼           ▼
 MCP 发布    引导登录/降级
```

### 状态文件中的记录

发布完成后，`state.json` 中会记录使用的发布方式：

```json
{
  "stages": [
    {
      "name": "publishing",
      "status": "completed",
      "outputs": {
        "published": true,
        "post_url": "https://www.xiaohongshu.com/discovery/item/...",
        "method_used": "mcp"
      }
    }
  ]
}
```

`method_used` 可能的值：
- `mcp` — 使用 xiaohongshu-mcp 发布
- `cdp` — 使用 post-to-xhs CDP 脚本发布
- `manual` — 手动发布

---

## 6. 开机自启配置（可选）

### macOS (LaunchAgent)

创建 `~/Library/LaunchAgents/com.xiaohongshu.mcp.plist`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.xiaohongshu.mcp</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/xiaohongshu-mcp</string>
        <string>server</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>~/.xiaohongshu-mcp/stdout.log</string>
    <key>StandardErrorPath</key>
    <string>~/.xiaohongshu-mcp/stderr.log</string>
</dict>
</plist>
```

加载服务：
```bash
launchctl load ~/Library/LaunchAgents/com.xiaohongshu.mcp.plist
```

### Linux (systemd)

创建 `/etc/systemd/system/xiaohongshu-mcp.service`：

```ini
[Unit]
Description=Xiaohongshu MCP Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/xiaohongshu-mcp server
Restart=always
User=%i

[Install]
WantedBy=multi-user.target
```

启用并启动：
```bash
sudo systemctl enable xiaohongshu-mcp
sudo systemctl start xiaohongshu-mcp
```

---

## 7. 常见问题

### Q: 服务启动失败，端口被占用？

```bash
# 查找占用端口的进程
lsof -i :18060

# 杀掉占用进程
kill -9 <PID>

# 或使用其他端口
xiaohongshu-mcp server --port 18061
```

### Q: 登录态经常失效？

- 检查是否在多设备同时登录
- 避免频繁切换 IP
- 定期检查登录状态，失效则重新扫码

### Q: MCP 工具列表为空？

- 确认服务地址是否正确
- 检查服务是否正常运行
- 查看服务日志排查错误

### Q: 如何更新 MCP 服务？

```bash
# 停止旧服务
# 下载新版本二进制文件替换
# 重新启动服务
```

---

## 8. 相关资源

- 小红书 MCP 发布指南：[`xhs-mcp-guide.md`](xhs-mcp-guide.md)
- 状态管理文档：[`./state-management.md`](./state-management.md)
