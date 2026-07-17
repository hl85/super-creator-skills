# 发布与共享包管理

## OpenClaw 元数据

Skills 在 YAML front matter 中包含 `metadata.openclaw` 字段：

```yaml
metadata:
  openclaw:
    homepage: https://github.com/hl85/super-creator#sc-<skill-name>
    requires:          # 仅适用于带脚本的 skill
      anyBins:
        - bun
        - npx
```

## 发布命令

```bash
bash scripts/sync-clawhub.sh           # 同步所有 skills
bash scripts/sync-clawhub.sh <skill>   # 同步单个 skill
```

发布钩子通过 `.releaserc.yml` 配置。本仓库不单独设置发布目录：发布准备只负责将 `packages/` 同步到每个 skill 的 `scripts/vendor/` 目录中，发布时直接读取 skill 目录。

## 共享工作区包

`packages/` 是**唯一**的真相来源。永远不要直接编辑 `skills/*/scripts/vendor/`。

当前共享包：
- `sc-chrome-cdp`（Chrome CDP 工具），被 2 个 skill 使用（`sc-publish-wechat`、`sc-publish-xhs`）
- `sc-md`（共享 Markdown 渲染和占位符处理），被 2 个 skill 使用（`sc-convert-markdown-to-html`、`sc-publish-wechat`）

**工作原理**：同步脚本将包复制到每个使用它的 skill 的 `vendor/` 目录，并将依赖规范重写为 `file:./vendor/<name>`。Vendor 副本会提交到 git，使 skills 是自包含的。

**更新流程**：
1. 在 `packages/` 下编辑包代码
2. 运行 `node scripts/sync-shared-skill-packages.mjs`
3. 将同步后的 `vendor/`、`package.json` 和 `bun.lock` 一起提交

**Git 钩子**：`npm install` 时会自动安装 `pre-push` 钩子（通过 `prepare` 脚本）。它会重新同步，如果 vendor 副本过期（`--enforce-clean`）会阻止推送。
