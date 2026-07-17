# CDP Automation Guide — Xiaohongshu

## 架构说明

Post-to-XHS 使用 Chrome CDP（DevTools Protocol）驱动浏览器自动化发布。脚本位于 `scripts/xhs-post.ts`，通过 Bun runtime 运行。

### 脚本架构

```
scripts/
├── xhs-post.ts              # 主发布脚本（入口）
├── xhs-utils.ts             # XHS 工具函数（Chrome 启动、剪贴板）
├── copy-to-clipboard.ts     # 图片复制到剪贴板（macOS/Linux/Windows）
├── paste-from-clipboard.ts  # 剪贴板粘贴自动化
├── package.json             # 依赖
└── vendor/
    └── sc-chrome-cdp/       # 共享 CDP 库（与 post-to-x、post-to-wechat 共用）
```

### 工作原理

1. **Chrome 启动**：查找或启动 Chrome，使用 `--remote-debugging-port` 和共享 super-creator profile
2. **CDP 连接**：通过 WebSocket 连接 Chrome DevTools Protocol
3. **页面会话**：打开/导航到 `https://creator.xiaohongshu.com/publish/publish`
4. **登录检测**：等待发布页面；未登录则导航到登录页并等待
5. **图片上传**：使用 `DOM.setFileInputFiles` 直接设置文件（首选），找不到文件输入则回退到剪贴板粘贴
6. **标题填充**：通过多个 CSS 选择器回退查找标题字段并填入
7. **正文填充**：通过多个 CSS 选择器回退查找正文区域并填入
8. **标签添加**：在正文区域输入 `#标签` 并自动选择话题建议
9. **发布**：通过多个选择器回退点击发布按钮

---

## 选择器参考

由于小红书 DOM 结构可能变化，脚本使用多层选择器回退策略。

### CSS 选择器速查表

| 元素 | 选择器（按优先级排序） |
|------|----------------------|
| 文件输入 | `input[type="file"]`, `input[accept*="image"]` |
| 标题 | `#title`, `input[placeholder*="标题"]`, `[class*="title"] input` |
| 正文 | `#caption`, `[placeholder*="正文"]`, `[class*="caption"]`, `div[contenteditable]` |
| 发布按钮 | `button[class*="publish"]`, `button[class*="submit"]`, 文本匹配"发布" |

### XPath 选择器参考

| 元素 | XPath 表达式 |
|------|-------------|
| 发布按钮 | `//button[contains(text(), "发布")]` |
| 标题输入框 | `//input[contains(@placeholder, "标题")]` |
| 正文区域 | `//*[@contenteditable="true" or contains(@placeholder, "正文")]` |
| 文件上传区域 | `//input[@type="file"]` |

### 选择器维护说明

- DOM 结构变化时，按优先级在列表前添加新的选择器
- 使用 `inspect-dom.ts` 工具检查当前页面结构：
  ```bash
  cd scripts && npx -y bun inspect-dom.ts
  ```
- 新选择器尽量使用属性选择器（placeholder、class 包含）而非固定 class name
- 保持多个回退选择器，确保兼容性

---

## 完整操作步骤（CDP 方式）

### 前置条件

1. 已安装 Chrome 浏览器
2. 已安装 Bun 运行时
3. 小红书账号已登录（首次运行会引导登录）

### 首次登录

1. 以预览模式运行脚本（不加 `--publish`）
2. Chrome 会启动并导航到发布页面
3. 未登录则自动跳转到登录页，使用小红书 App 扫码登录
4. 登录后导航回发布页面，Cookie 持久化到 profile

### 预览模式（默认）

```bash
cd scripts && npx -y bun xhs-post.ts note \
  --title "笔记标题" \
  --caption "正文内容" \
  --image ./img1.png --image ./img2.png \
  --tag 面试 --tag 求职
```

脚本会填写所有内容，但不会点击发布，浏览器保持打开供人工审核。

### 直接发布模式

```bash
cd scripts && npx -y bun xhs-post.ts note \
  --title "笔记标题" \
  --caption-file caption.md \
  --image ./img1.png --image ./img2.png \
  --tag 面试 --tag 求职 \
  --publish
```

脚本会自动填写并点击发布按钮。

### 从文件读取正文

```bash
cd scripts && npx -y bun xhs-post.ts note \
  --title "笔记标题" \
  --caption-file ./caption.md \
  --image ./cover.png
```

### 自定义 Chrome Profile

```bash
cd scripts && npx -y bun xhs-post.ts note \
  --title "笔记标题" \
  --image ./img.png \
  --profile ~/.config/super-creator/chrome-profile
```

---

## 图片上传策略

### 首选：DOM.setFileInputFiles

- 通过 CDP DOM 查找 `<input type="file">` 元素
- 使用 `DOM.setFileInputFiles` CDP 命令直接设置文件
- 更可靠 — 无需剪贴板或辅助功能权限
- 支持批量上传（所有图片一次性上传）

### 回退：剪贴板粘贴

- 通过 Swift（macOS）/ xclip（Linux）/ PowerShell（Windows）将图片复制到剪贴板
- 点击上传区域，然后模拟 Cmd+V / Ctrl+V
- macOS 需要辅助功能权限

---

## 标题与正文填充策略

使用 `Runtime.evaluate` 执行 JavaScript：
1. 通过多个 CSS 选择器回退查找元素
2. 对于 `<input>` / `<textarea>`：使用原生 setter + 派发 input/change 事件
3. 对于 `contenteditable`：使用 `document.execCommand('insertText')`

---

## 故障排查

### 图片上传失败

**症状**：图片没有出现在编辑器中

**排查步骤**：
1. 检查文件路径是否正确（相对路径需相对于 scripts 目录）
2. 检查图片格式（支持 JPG/PNG/WebP）
3. 检查图片大小（单张 10MB 以内）
4. 检查文件输入选择器是否匹配当前 DOM
5. 尝试使用 `inspect-dom.ts` 检查页面结构

### 标题/正文填写不生效

**症状**：内容填写了但没有显示或发布时为空

**排查步骤**：
1. 检查选择器是否匹配当前页面结构
2. 确认是 input/textarea 还是 contenteditable 元素
3. 手动检查 React/Vue 框架是否需要额外事件触发
4. 使用 `--debug` 模式查看详细日志

### 发布按钮点不到

**症状**：脚本执行完但没发布

**排查步骤**：
1. 检查发布按钮选择器是否匹配
2. 确认按钮是否在视口内（可能需要滚动）
3. 检查是否有弹窗遮挡（如协议确认、新手引导）
4. 手动关闭弹窗后重试

### Chrome 启动失败

**症状**：脚本报错无法连接 Chrome

**排查步骤**：
1. 确认 Chrome 已安装
2. 检查 9222 端口是否被占用
3. 手动关闭所有 Chrome 窗口后重试
4. 检查 Chrome profile 目录权限

### 登录态丢失

**症状**：每次都需要重新登录

**排查步骤**：
1. 确认使用了正确的 Chrome profile
2. 检查 profile 目录是否有写入权限
3. 不要手动清除浏览器 cookie
4. 检查是否多设备登录被挤下线

### 已知限制

- 小红书 DOM 结构可能变化；脚本使用多个选择器回退但可能需要更新
- 不支持定时发布
- 不支持视频笔记（仅图文笔记）
- 位置标签尚未自动化
