# Pipeline 通用阶段框架

sc-pipeline 是通用内容生产编排器，根据 `--platform` 参数加载不同的阶段配置。本文档说明通用的阶段流转机制；平台专属的详细操作指南请查看对应平台文档。

---

## 编排器工作原理

sc-pipeline 根据启动参数 `--platform/-p` 的值（`xhs` 或 `wechat`）动态加载阶段配置：

- 平台参数决定了有哪些阶段、每个阶段调用什么 skill、阶段间如何流转
- 状态文件中的 `platform` 字段记录了当前 pipeline 的目标平台
- resume 时自动读取状态文件中的 platform 字段，无需再次指定

```
sc-pipeline start -p <platform> --source <file>
         │
         ▼
┌─────────────────────┐
│ 加载平台阶段配置     │
│ xhs: 5阶段          │
│ wechat: 5阶段       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 初始化状态文件       │
│ (.super/{project}/  │
│  state.json)        │
└────────┬────────────┘
         │
         ▼
   逐阶段执行流水线
         │
         ▼
   全流程完成 → 产物迁移
```

---

## 双平台阶段对照

| 序号 | 小红书（xhs） | 微信公众号（wechat） | 类型 |
|------|--------------|-------------------|------|
| 1 | mining（内容挖掘） | mining（内容挖掘） | 通用 |
| 2 | writing（文案撰写） | writing（文案撰写） | 平台差异（输出格式不同） |
| 3 | imaging（信息图生成） | visuals（封面图+文章配图） | 平台专属 |
| 4 | review（硬闸门：审核+压缩） | review（硬闸门：排版+审核+压缩） | 平台差异（检查项不同） |
| 5 | publishing（发布） | publishing（发布） | 平台专属 |

### 阶段流转图

```
小红书（xhs）:
mining → writing → imaging → review(硬闸门) → publishing

微信公众号（wechat）:
mining → writing → visuals → review(硬闸门) → publishing
```

---

## 通用阶段流转机制

无论哪个平台，每个阶段都遵循相同的生命周期：

```
    pending
       │
    开始执行
       ▼
   in_progress ────失败──→ failed
       │                     │
    执行完成              重试/跳过
       ▼                     │
   completed            in_progress / skipped
       │
   用户确认 (Checkpoint)
       │
  ┌────┴────┐
  │         │
确认通过   要求修改
  │         │
  ▼         ▼
下一阶段   in_progress
(pending)  （重新执行）
```

### 关键规则

1. **顺序执行**：阶段按顺序依次执行，不可跳过（除非用户明确要求跳过并记录）
2. **每步确认**：每个阶段完成后必须经过用户 Checkpoint 确认才能进入下一阶段
3. **硬闸门**：review 阶段是自动化强制检查，不通过（有 critical 问题）则阻塞
4. **可回退**：用户可要求从任意已完成阶段重跑，后续阶段状态重置为 pending
5. **可续跑**：状态持久化到文件，跨对话可从断点继续

---

## 平台专属指南

每个平台的详细操作步骤、Checkpoint 清单、输入输出格式、FAQ 请查阅：

- **小红书（xhs）**：[platforms/xhs.md](platforms/xhs.md)
  - mining → writing (sc-writer -p xhs) → imaging (sc-xhs-images) → review (sc-content-review + sc-compress-image) → publishing (sc-publish-xhs)
  - 短图文笔记，2-9 张信息图，三级降级发布策略

- **微信公众号（wechat）**：[platforms/wechat.md](platforms/wechat.md)
  - mining → writing (sc-writer -p wechat) → visuals (sc-cover-image + sc-article-illustrator) → review (sc-format-markdown + sc-content-review + sc-compress-image) → publishing (sc-publish-wechat)
  - 深度长文，封面图+配图，草稿箱/直接群发两种发布模式

---

## 硬闸门机制

review 阶段是发布前的硬闸门，所有平台都必须通过。详见 [hard-gates.md](hard-gates.md)。

闸门检查项：
- **内容审核**（sc-content-review）：critical 阻塞，warning 需用户确认
- **图片压缩**（sc-compress-image）：所有图片必须压缩为 WebP
- **排版格式化**（sc-format-markdown，仅 wechat）：公众号排版格式化

---

## 状态管理

状态文件完整 Schema、状态转移图、错误恢复策略详见 [state-management.md](state-management.md)。
