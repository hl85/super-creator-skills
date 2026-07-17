# 发布策略

## 概述

super-creator 的发布流程通过 `/release-skills` Claude skill 实现**自动化**，支持 monorepo 风格的多 skill 发布，并能自动同步所有版本文件的版本号。

## 版本管理

### 单一真相来源

**主版本文件**：`marketplace.json`

```json
{
  "metadata": {
    "version": "3.0.0"
  }
}
```

所有其他版本文件在发布期间会**自动同步**以匹配此版本。

### 版本文件（自动同步）

| 文件 | 路径 | 用途 | 手动编辑？ |
|------|------|------|-----------|
| **marketplace.json** | `$.metadata.version` | 插件注册表（主要） | ❌ 否 |
| **CHANGELOG.md** | 章节标题 | 英文更新日志（自动生成） | ❌ 否 |
| **CHANGELOG.zh.md** | 章节标题 | 中文更新日志（自动生成） | ❌ 否 |
| **package.json** | `$.version` | Node.js 元数据 | ❌ 否 |

### 策略

1. 发布期间**永远不要手动编辑版本文件**
2. 始终使用 `/release-skills` skill 进行版本升级
3. 版本变更基于提交分析自动进行
4. 所有版本文件必须保持同步（由 `scripts/verify-version-sync.mjs` 强制执行）

## 版本控制方案

**语义化版本控制**：MAJOR.MINOR.PATCH（例如 3.0.0）

### 版本升级规则

基于上一个标签以来的 git log 分析：

1. **检测到 BREAKING CHANGE** → 主版本升级（例如 2.0.0 → 3.0.0）
   - 提交正文包含 `BREAKING CHANGE:`
   - 公共 API 被移除或重命名
   - 接口发生变更

2. **存在 `feat:` 提交** → 次版本升级（例如 3.0.0 → 3.1.0）
   - 添加了新功能

3. **只有 `fix:` 和其他提交** → 补丁版本升级（例如 3.0.1 → 3.0.2）
   - Bug 修复、重构、文档、测试

4. **用户覆盖** → 使用指定版本
   - `--major`、`--minor`、`--patch` 标志

## 发布工作流

### 步骤 1：准备发布分支

```bash
git checkout -b release/x.y.z develop
```

### 步骤 2：验证发布前检查

```bash
# 运行所有测试
npm test

# 检查版本一致性
node scripts/verify-version-sync.mjs

# 验证没有未提交的更改
git status
```

### 步骤 3：预览发布

```bash
/release-skills --dry-run
```

输出包括：
- 检测到的更改（按 skill/模块分组）
- 提议的版本号
- 多语言更新日志预览

**仔细审核**：
- 更新日志是否准确描述了更改？
- 版本升级是否正确？
- 是否列出了所有受影响的 skills？

### 步骤 4：执行发布

```bash
/release-skills
```

自动化步骤：
1. 分析上一个标签以来的提交
2. 生成/更新 CHANGELOG.md 和 CHANGELOG.zh.md
3. 更新 marketplace.json 版本
4. 创建发布提交：`chore: release vX.Y.Z`
5. 创建 git 标签：`vX.Y.Z`
6. 调用钩子：
   - `prepare_artifact`：同步共享包
   - `publish_artifact`：发布到 ClawHub

### 步骤 5：集成发布

```bash
# 将 release 分支合并到 main
git checkout main
git merge release/x.y.z
git push origin main --follow-tags

# 将 main 合并回 develop
git checkout develop
git merge main
git push origin develop

# 删除 release 分支
git branch -d release/x.y.z
```

## 更新日志指南

### Conventional Commits

提交必须遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

<可选正文>
```

**类型**：
- `feat`：新功能
- `fix`：Bug 修复
- `refactor`：代码重构（无行为变更）
- `perf`：性能改进
- `docs`：文档变更
- `test`：测试变更
- `chore`：维护（从更新日志中排除）
- `style`：格式（从更新日志中排除）

**范围**（可选但推荐）：
- Skill 名称（例如 `sc-cover-image`、`sc-publish-xhs`）
- `project` 用于根级别的更改

**提交示例**：
```bash
git commit -m "feat(sc-cover-image): add watercolor style"
git commit -m "fix(sc-publish-xhs): handle special characters in hashtags"
git commit -m "refactor(project): move release scripts to ops/"
```

### 更新日志格式

由 `/release-skills` 自动生成英文和中文版本。

**英文（CHANGELOG.md）**：
```markdown
## 3.1.0 - 2026-05-13

### Features
- Add watercolor style to sc-cover-image
- Support OAuth2 authentication in api-gateway

### Fixes
- Fix special character handling in sc-publish-xhs
- Improve error messages in sc-imagine skill

### Documentation
- Update architecture guide in README.md
```

**中文（CHANGELOG.zh.md）**：
```markdown
## 3.1.0 - 2026-05-13

### 新功能
- 为 sc-cover-image 添加水彩风格
- 在 api-gateway 中支持 OAuth2 认证

### 修复
- 修复 sc-publish-xhs 中特殊字符的处理
- 改进 sc-imagine skill 中的错误消息

### 文档
- 更新 README.md 中的架构指南
```

### 第三方贡献

当贡献来自非所有者开发者时，会添加归属：

```markdown
## 3.1.0 - 2026-05-13

### Features
- Add watercolor style to sc-cover-image (by @contributor1)
```

## 发布钩子

在 `.releaserc.yml` 中定义：

### prepare_artifact 钩子

**用途**：在发布前使每个 skill 自包含

**命令**：
```bash
node scripts/sync-shared-skill-packages.mjs \
  --repo-root "{project_root}" \
  --target "{target}"
```

**职责**：
- 将共享包从 `packages/` 同步到 skill 的 `vendor/`
- 将依赖规范重写为基于文件的路径
- 确保 skill 是自包含的

### publish_artifact 钩子

**用途**：将准备好的 skill 发布到 ClawHub 注册表

**命令**：
```bash
node scripts/publish-skill.mjs \
  --skill-dir "{target}" \
  --version "{version}" \
  --changelog-file "{release_notes_file}" \
  --dry-run "{dry_run}"
```

**职责**：
- 将 skill 上传到 ClawHub
- 附加版本和更新日志
- 处理身份验证

## 热修复流程

对于生产版本的紧急修复：

```bash
# 从 main 创建 hotfix 分支
git checkout -b hotfix/critical-bug main

# 修复并测试
# ... 进行更改 ...
git add .
git commit -m "fix(sc-skill-name): critical security patch"

# 发布补丁版本
/release-skills --patch

# 合并回 main 和 develop
git checkout main
git merge hotfix/critical-bug
git push origin main --follow-tags

git checkout develop
git merge main
git push origin develop

git branch -d hotfix/critical-bug
```

## 发布前检查清单

在执行 `/release-skills` 之前，确保：

- [ ] 所有测试通过（`npm test`）
- [ ] 没有未提交的更改（`git status`）
- [ ] 在 release 分支上工作（`git branch | grep release/`）
- [ ] 版本一致性已验证（`node scripts/verify-version-sync.mjs`）
- [ ] CHANGELOG 预览已审核（`/release-skills --dry-run`）
- [ ] 所有受影响的 skills 都在提交中记录
- [ ] README.md 已更新（如需要）
- [ ] 所有共享包已同步（`node scripts/sync-shared-skill-packages.mjs`）

## 故障排除

### 版本不匹配错误

如果 `verify-version-sync.mjs` 失败：

```bash
# 检查当前版本
cat marketplace.json | jq '.metadata.version'
grep "^## " CHANGELOG.md | head -1

# 如果 marketplace.json 是主要的，更新其他文件：
/release-skills --dry-run
# 审核并执行
```

### 发布失败

如果 `publish_artifact` 钩子失败：

1. 检查 ClawHub 身份验证：`clawhub login`
2. 验证 skill 是自包含的：`node scripts/sync-shared-skill-packages.mjs`
3. 以 dry-run 模式运行：`npm run release -- --dry-run`

### 合并期间的 Git 冲突

```bash
# 手动解决冲突
git status
# 修复文件中的冲突
git add .
git commit -m "chore: resolve merge conflicts during release"
git push
```

## 参考资料

- `.releaserc.yml` - 发布配置（钩子、目标）
- `scripts/` - 发布实现脚本
- `.githooks/` - Git hooks（pre-commit、pre-push 验证，自动安装）
- `/release-skills` - Claude skill（工作流驱动）
