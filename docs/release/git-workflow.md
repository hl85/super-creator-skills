# Git 工作流策略

## 概述

Super-creator 使用 **Git Flow** 分支模型配合自动化发布流程。

```
main (生产环境)
 ├── v3.0.0 (标签)
 ├── v3.0.1 (标签)
 └── v3.1.0 (标签)

develop (集成分支)
 ├── feature/user-auth
 ├── feature/performance
 ├── release/3.1.0 (临时分支)
 └── (从 main 合并)

hotfix (紧急修复)
 └── hotfix/security-patch (从 main 创建)
```

## 分支类型

### main (生产环境)

**用途**：稳定、已发布的代码

**规则**：
- 受保护分支（需要 PR 审核）
- 只能从 `release/` 或 `hotfix/` 分支合并
- 每个提交都标记版本号（v3.0.0、v3.0.1 等）
- 必须始终处于可发布状态

**工作流**：
```bash
# 不要直接提交到 main
# 始终使用 release 或 hotfix 分支

git checkout main
git merge --no-ff release/x.y.z    # 发布测试完成后
git tag vx.y.z
git push origin main --follow-tags
```

### develop (集成)

**用途**：功能开发的集成分支

**规则**：
- 受保护分支（需要状态检查通过）
- 始终与 main 保持同步（发布后）
- 所有功能分支的基础分支

**工作流**：
```bash
git checkout develop
git pull origin develop

# 从这里创建功能分支
git checkout -b feature/my-feature
```

### feature/* (功能开发)

**用途**：开发单个功能或修复

**命名约定**：`feature/<feature-name>`

**规则**：
- 从：`develop` 创建
- 合并回：`develop`（通过 PR）
- 提交信息：遵循 Conventional Commits 规范
- 短期分支（合并后删除）

**工作流**：
```bash
git checkout develop
git pull origin develop
git checkout -b feature/add-new-skill

# ... 进行提交 ...
git commit -m "feat(sc-new-skill): initial implementation"
git commit -m "feat(sc-new-skill): add tests"
git push origin feature/add-new-skill

# 在 GitHub 上创建 PR
# 审核通过且 CI 通过后 → 合并到 develop
```

### release/* (发布准备)

**用途**：准备发布（版本号更新、更新日志、测试）

**命名约定**：`release/x.y.z`（匹配版本号）

**规则**：
- 从：`develop` 创建
- 合并到：`main` 并回合并到 `develop`
- 只允许版本/更新日志相关的提交
- 合并到 main 前必须完成测试
- 合并后删除

**工作流**：
```bash
git checkout -b release/3.1.0 develop

# 验证测试通过
npm test

# 运行发布自动化
/release-skills --dry-run
/release-skills

# 这会创建：
# - 更新后的 marketplace.json
# - 更新后的 CHANGELOG.md、CHANGELOG.zh.md
# - 提交："chore: release v3.1.0"
# - 标签：v3.1.0

# 合并到 main
git checkout main
git merge --no-ff release/3.1.0
git push origin main --follow-tags

# 合并回 develop
git checkout develop
git merge --no-ff main
git push origin develop

# 删除 release 分支
git branch -d release/3.1.0
git push origin --delete release/3.1.0
```

### hotfix/* (紧急修复)

**用途**：修复生产环境的关键 bug

**命名约定**：`hotfix/<fix-name>`

**规则**：
- 从：`main`（生产分支）创建
- 合并到：`main` 和 `develop`
- 只升级补丁版本号（`--patch` 标志）
- 合并到 main 前必须完成测试
- 合并后删除

**工作流**：
```bash
# 当生产环境发现关键 bug 时
git checkout -b hotfix/security-vulnerability main

# 修复 bug
git add .
git commit -m "fix(sc-skill-name): critical security fix"

# 充分测试
npm test

# 发布补丁版本
/release-skills --patch

# 合并到 main
git checkout main
git merge --no-ff hotfix/security-vulnerability
git push origin main --follow-tags

# 合并回 develop
git checkout develop
git merge --no-ff main
git push origin develop

# 删除 hotfix 分支
git branch -d hotfix/security-vulnerability
git push origin --delete hotfix/security-vulnerability
```

## 工作流示例

### 示例 1：添加新功能

```bash
# 1. 从 develop 开始
git checkout develop
git pull origin develop

# 2. 创建功能分支
git checkout -b feature/add-cover-style

# 3. 实现功能
# ... 编辑 sc-cover-image skill ...
git add skills/sc-cover-image/
git commit -m "feat(sc-cover-image): add watercolor style"
git commit -m "test(sc-cover-image): add watercolor style tests"

# 4. 推送到 GitHub
git push origin feature/add-cover-style

# 5. 在 GitHub 上创建 PR
# → GitHub 显示：Ready to merge into develop from feature/add-cover-style
# → CI 检查自动运行
# → 进行代码审核

# 6. 审核通过后，通过 GitHub 合并（创建合并提交）
# → 功能分支自动删除（如果配置了）

# 7. 本地同步
git checkout develop
git pull origin develop
```

### 示例 2：发布到生产环境

```bash
# 1. 创建 release 分支
git checkout -b release/3.1.0 develop

# 2. 验证一切就绪
npm test
node scripts/verify-version-sync.mjs

# 3. 预览发布
/release-skills --dry-run

# 预期输出：
# Project detected:
#   Version file: marketplace.json (3.0.0)
#   Changelogs: CHANGELOG.md (en), CHANGELOG.zh.md (zh)
# 
# Last tag: v3.0.0
# Proposed version: v3.1.0
# 
# Changes grouped:
#   sc-cover-image:
#     - feat: add watercolor style
#   sc-publish-xhs:
#     - fix: handle special characters
#   project:
#     - docs: update README.md
# 
# Changelog preview (zh):
#   ## 3.1.0 - 2026-05-13
#   ### 新功能
#   - 为 sc-cover-image 添加水彩风格
#   ### 修复
#   - 修复 sc-publish-xhs 中特殊字符处理

# 4. 执行发布
/release-skills

# 这会自动：
# - 将 marketplace.json 更新到 3.1.0
# - 生成 CHANGELOG.md 3.1.0 部分
# - 生成 CHANGELOG.zh.md 3.1.0 部分
# - 创建提交："chore: release v3.1.0"
# - 创建标签：v3.1.0
# - 调用钩子（prepare_artifact、publish_artifact）

# 5. 合并到 main
git checkout main
git pull origin main
git merge --no-ff release/3.1.0

# 预期：
# Merge made by the 'recursive' strategy.

# 6. 推送 main 和标签
git push origin main --follow-tags

# 7. 合并回 develop
git checkout develop
git pull origin develop
git merge --no-ff main

# 如果有冲突（changelog），手动解决：
# - 保留 main 中的最新版本部分
# - 提交："chore: sync develop with main after release"
git push origin develop

# 8. 清理
git branch -d release/3.1.0
git push origin --delete release/3.1.0
```

### 示例 3：紧急热修复

```bash
# 1. 从 main 创建 hotfix
git checkout -b hotfix/fix-wechat-auth main

# 2. 进行关键修复
# ... 编辑 sc-publish-wechat skill ...
git commit -m "fix(sc-publish-wechat): fix authentication token expiry"

# 3. 充分测试
npm test

# 4. 只发布补丁版本
/release-skills --patch

# 提议：3.0.0 → 3.0.1

# 5. 合并到 main
git checkout main
git pull origin main
git merge --no-ff hotfix/fix-wechat-auth
git push origin main --follow-tags

# 6. 合并到 develop
git checkout develop
git pull origin develop
git merge --no-ff main
git push origin develop

# 7. 清理
git branch -d hotfix/fix-wechat-auth
git push origin --delete hotfix/fix-wechat-auth
```

## GitHub 配置

### 分支保护规则

**对于 `main` 分支**：
- ✅ 合并前需要 PR 审核（1 个审核者）
- ✅ 新提交推送时驳回过时的 PR 批准
- ✅ 合并前需要状态检查通过（CI/CD）
- ✅ 合并前分支必须是最新的
- ✅ 合并前必须解决所有代码审核意见
- ❌ 不允许直接推送（使用 PR 工作流）

**对于 `develop` 分支**：
- ✅ 合并前需要状态检查通过（CI/CD）
- ✅ 合并前分支必须是最新的
- ⚠️ 允许从 release 和 hotfix 分支直接推送
- ❌ 需要 PR 审核（可选，为了更安全建议开启）

### 必需的状态检查

- ✅ CI/CD 流水线（GitHub Actions 或类似）
- ✅ 所有测试通过
- ✅ 无合并冲突

## 约定

### 提交信息

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

<可选正文>
```

**类型**：feat, fix, refactor, perf, docs, test, chore, style

**范围**：skill 名称或 `project`

**示例**：
```bash
git commit -m "feat(sc-cover-image): add watercolor and minimalist styles"
git commit -m "fix(sc-publish-xhs): handle special characters in hashtags"
git commit -m "docs(project): update architecture documentation"
git commit -m "refactor(sc-imagine): improve prompt generation logic"
```

### 合并提交

始终使用 `--no-ff`（不快进）来保留分支历史：

```bash
git merge --no-ff feature/my-feature
# 创建：Merge branch 'feature/my-feature' into develop
```

### 标签格式

版本标签遵循语义化版本控制：

```bash
v3.0.0    # 主版本发布
v3.0.1    # 补丁版本发布
v3.1.0    # 次版本发布
```

标签由 `/release-skills` **自动创建**。

## 本地设置

一次性设置：

```bash
# 克隆仓库
git clone https://github.com/hl85/super-creator.git
cd super-creator

# 安装依赖（通过 `prepare` 脚本自动配置 git hooks）
npm install

# 拉取所有分支
git fetch origin
git checkout develop

# 验证设置
git branch -a
git hooks show    # 应该显示 pre-push hook 已安装
```

## 日常操作

```bash
# 开始一天：与远程同步
git fetch origin
git status

# 创建功能分支
git checkout -b feature/my-feature develop
git pull origin develop  # 确保是最新的

# ... 进行修改 ...

# 推送前：验证
node scripts/verify-version-sync.mjs  # 如果修改了版本

# 推送
git push origin feature/my-feature

# 在 GitHub 上创建 PR
```

## 故障排除

### "main is not up to date with develop"

```bash
# 这可能在 hotfix 后发生
# 解决方案：将 main 合并到 develop
git checkout develop
git pull origin develop
git merge origin/main
# 如果有冲突则解决
git push origin develop
```

### CHANGELOG 合并冲突

在发布合并期间，CHANGELOG 冲突是预期的：

```bash
# 当将 release 合并到 develop 时：
# 两个分支都修改了 CHANGELOG.md
# 解决方案：
git status  # 显示 CHANGELOG.md 有冲突

# 保留 develop 的当前状态（最新添加的内容）：
git checkout --theirs CHANGELOG.md
git add CHANGELOG.md
git commit -m "chore: resolve changelog conflicts"
git push
```

### 意外提交到 main

```bash
# 如果你直接提交到了 main（不要这样做）：
git log --oneline -5  # 识别提交

# 选项 1：还原提交（推荐）
git revert <commit-hash>
git push origin main

# 选项 2：重置并重做（仅在未推送时）
git reset --soft HEAD~1
git push -f origin main  # 谨慎使用！
```

## 参考资料

- `docs/release/release-strategy.md` - 发布自动化
- `.releaserc.yml` - 发布配置
- `.githooks/` - Git hooks（根目录，自动安装）
- `scripts/` - 发布脚本
