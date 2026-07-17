# 浏览器自动化通用技巧

## MCP 工具优先级检查

**在开始任何浏览器操作前，按以下顺序检查可用工具：**

### 1. 第一优先级：IDE 内置 integrated_browser
TRAE、Cursor 等主流 AI IDE 已内置此 MCP，直接可用，无需安装。

检查方法：尝试调用 `browser_tabs`，如果成功则使用。

核心工具列表：
| 工具名 | 用途 |
|--------|------|
| `browser_tabs` | 列出/选择/新建/关闭标签页 |
| `browser_navigate` | 跳转到指定 URL |
| `browser_snapshot` | 获取页面可访问性快照（最重要！） |
| `browser_click` | 点击元素 |
| `browser_type` | 在输入框中输入文本 |
| `browser_press_key` | 按键（Enter、Escape 等） |
| `browser_wait_for` | 等待文本出现/消失，或固定等待时间 |
| `browser_evaluate` | 在页面执行 JavaScript |
| `browser_scroll` | 滚动页面 |
| `browser_take_screenshot` | 截图 |

### 2. 第二优先级：@playwright/mcp（外部安装）
如果 IDE 没有内置浏览器工具，再安装微软官方的 Playwright MCP。

安装配置：
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### 3. 不推荐：自己写 CDP/反向工程代码
- 维护成本极高
- 网站前端更新就失效
- 容易被检测为机器人
- 已经有现成的专业工具

---

## 操作最佳实践

### 1. 永远先 snapshot 再操作

**错误做法：** 硬编码假设页面结构，直接操作。

**正确做法：**
```
1. browser_snapshot() 获取当前页面结构
2. 从返回的 YAML 中找到目标元素的 ref
3. 使用 ref 进行 click/type 等操作
4. 操作后再次 snapshot 确认状态变化
```

### 2. 合理使用等待

| 场景 | 等待方式 |
|------|---------|
| 页面导航 | browser_navigate 自带等待 |
| 等待按钮出现 | browser_wait_for(text: "按钮文字") |
| 等待加载完成 | browser_wait_for(textGone: "加载中...") |
| 固定延迟（不得已时） | browser_wait_for(time: 3) |
| AI 生图 | 轮询 snapshot（3-5秒间隔） |

### 3. 标签页管理

```
- 优先复用用户已打开的标签页，不要总是新开标签
- 使用 browser_tabs(action: "list") 先查看现有标签
- 通过 URL 或标题识别目标标签页
- 记录 viewId 供后续操作使用
```

### 4. 元素定位技巧

从 snapshot 中识别元素：
- **按钮**：role: button + name 属性
- **输入框**：role: textbox + placeholder/name
- **图片**：role: img + name/alt
- **链接**：role: link
- **通用容器**：role: generic（通常不直接操作）

如果 snapshot 返回的元素太多，使用 `interactive: true` 参数只显示可交互元素。

### 5. 输入文本

```
browser_type 参数建议：
- 先 click 聚焦输入框再 type
- 输入中文直接传中文字符串即可
- 需要提交时设置 submit: true（相当于输完按 Enter）
- 如果页面有自动补全干扰，使用 slowly: true 逐字输入
```

---

## 下载文件处理

### 浏览器默认下载位置
- macOS: `~/Downloads/`
- Windows: `C:\Users\[用户名]\Downloads\`
- Linux: `~/Downloads/`

### 下载后确认
1. 点击下载按钮后等待几秒
2. 可以提示用户检查下载目录
3. 如果需要移动到特定位置，使用系统命令操作下载目录中的文件

---

## 处理弹窗和对话框

- **Alert/Confirm/Prompt**：使用 `browser_handle_dialog` 处理
- **Cookie 同意框**：找到"接受"/"同意"按钮点击关闭
- **登录提示**：提示用户手动完成登录，不要尝试自动填写账号密码
- **升级/付费提示**：找到关闭按钮（通常是 X）关闭即可
