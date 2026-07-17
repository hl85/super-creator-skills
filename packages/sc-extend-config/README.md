# sc-extend-config

通用 EXTEND.md 多账号配置包。

## 状态

🚧 **M1 脚手架版本** — 仅完成包结构、类型定义、错误类型。业务逻辑在 M2-M5 实施。

## 设计文档

完整的架构设计文档：`/tmp/sc-extend-config-design.md`（1285 行）

## 计划里程碑

- **M1**（当前）：包骨架 + types + errors + 占位符
- **M2**：parser + locate + section + account + credentials + env-file 完整实现
- **M3**：x / wechat 适配器 + 旧 wrapper 改造
- **M4**：weibo / xhs 适配器
- **M5**：完整单测 + 同步到 4 个 skill
