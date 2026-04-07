# Rebrand: baoyu-skills → supercreator

## TL;DR

> **Quick Summary**: Fork 自 JimLiu/baoyu-skills 的 skill 集合全面品牌重命名——去掉所有 `baoyu-` 前缀，plugin 改名为 `supercreator`，删除废弃 skill，在 README 声明 fork 来源。
> 
> **Deliverables**:
> - 19 个 skill 目录去掉 `baoyu-` 前缀 (e.g. `imagine/`, `comic/`)
> - 3 个 workspace package 改名为 `sc-` 前缀 (`sc-md`, `sc-fetch`, `sc-chrome-cdp`)
> - 所有内部引用（import、config、SKILL.md、vendor、runtime paths、env vars）同步更新
> - 废弃的 `baoyu-image-gen` 彻底删除
> - marketplace.json plugin 改名为 `supercreator`
> - README 添加 fork 归属声明
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 6 waves
> **Critical Path**: Delete deprecated → Rename packages → Sync vendors → Rename skills → Update runtime paths → Update docs

---

## Context

### Original Request
将 fork 自 JimLiu/baoyu-skills 的 skill 集合进行系统升级：
- skill 名从 baoyu-skills 改为 supercreator
- 目录的 baoyu- 前缀去掉
- 在重要位置声明 fork 来源

### Interview Summary
**Key Discussions**:
- 目录/文件/代码一并修改，全面替换
- 若去前缀有语法冲突，使用 `sc-` 前缀
- 已废弃的 `baoyu-image-gen` 直接删除
- Fork 归属声明只在 README 里

**Research Findings**:
- 全仓库 1713 处 "baoyu" 出现，涉及 144 个文件
- 19 个活跃 skill + 1 个废弃 skill + 3 个 workspace package + 9 个 vendored 副本
- 运行时配置路径 `~/.baoyu-skills/` 和 `.baoyu-skills/` 影响用户已有配置
- 环境变量 `BAOYU_*` 前缀（6+ 个独立变量）
- vendor 同步脚本 `scripts/sync-shared-skill-packages.mjs` 通过 glob 发现 packages/*，非硬编码
- 预推送 hook `.githooks/pre-push` 验证 vendor 副本一致性
- Git remote 已指向 `hl85/suppercreator.git`

### Metis Review
**Identified Gaps** (addressed):
- Package 去前缀后名字太泛（`md`, `fetch`）— 使用 `sc-` 前缀解决
- 运行时配置目录名和向后兼容 — 需要用户决定
- 环境变量前缀和向后兼容 — 需要用户决定
- `baoyu-imagine` 中有旧迁移逻辑 — 可移除（全新 fork）
- Git remote 有拼写错误（suppercreator 双 p）— 需要用户确认
- vendor 同步脚本依赖 glob 非硬编码 — 已验证安全

---

## Work Objectives

### Core Objective
将整个代码库从 `baoyu-skills` / `baoyu-` 品牌系统性重命名为 `supercreator`，同时保留所有运行时行为不变。

### Concrete Deliverables
- 所有 `skills/baoyu-*` 目录改为去前缀名（`skills/imagine/`, `skills/comic/` 等）
- 所有 `packages/baoyu-*` 目录改为 `sc-` 前缀（`packages/sc-md/` 等）
- `marketplace.json` plugin name 改为 `supercreator`
- `package.json` name 改为 `supercreator`
- 所有 SKILL.md front matter 更新
- 所有 TypeScript import 语句更新
- 所有运行时路径更新
- 所有环境变量前缀更新
- README.md / README.zh.md 添加 fork 声明
- `baoyu-image-gen/` 目录彻底删除

### Definition of Done
- [ ] `npm test` 通过 (exit code 0)
- [ ] `grep -rn 'baoyu' --include='*.ts' --include='*.js' --include='*.json' . | grep -v CHANGELOG | grep -v .sisyphus | grep -v node_modules` 返回零结果
- [ ] `node scripts/sync-shared-skill-packages.mjs --repo-root . --enforce-clean` 通过
- [ ] `ls skills/ | grep baoyu` 返回空
- [ ] README 中包含 fork 归属声明

### Must Have
- 所有 baoyu- 前缀从 skill 目录名移除
- Workspace packages 使用 sc- 前缀避免命名冲突
- marketplace.json 路径与实际目录匹配
- 所有 import/require 语句正确解析
- 所有测试通过
- README fork 归属声明

### Must NOT Have (Guardrails)
- 不得改变任何运行时行为、输出格式、API 契约
- 不得重构 vendor 同步架构（只改名，不改逻辑）
- 不得新增独立迁移 CLI 工具
- 不得修改 CHANGELOG 历史条目内容
- 不得修改 `.github/workflows/test.yml`（不含 baoyu 引用）
- 不得修改 `.claude/skills/release-skills/`（无 baoyu- 前缀）
- 不得新增测试（只更新现有测试的期望值）
- 不得修改 workspace glob `"packages/*"`（自动发现目录）

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: Tests-after (更新现有测试期望值，跑通即可)
- **Framework**: Node.js built-in test runner via `npm test`

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Package renames**: Bash — `npm test`, `grep` 验证无残留
- **Directory renames**: Bash — `ls`, `cat marketplace.json`, `npm test`
- **Import updates**: Bash — `grep` + `npm test`
- **Runtime paths**: Bash — `grep` + `npm test`
- **Docs**: Bash — `grep` 验证 fork 声明存在

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 0 (Cleanup — remove deprecated, reduce scope):
└── Task 1: Delete baoyu-image-gen [quick]

Wave 1 (Foundation — rename workspace packages, 3 parallel):
├── Task 2: Rename packages/baoyu-md → packages/sc-md [unspecified-high]
├── Task 3: Rename packages/baoyu-fetch → packages/sc-fetch [unspecified-high]
└── Task 4: Rename packages/baoyu-chrome-cdp → packages/sc-chrome-cdp [unspecified-high]

Wave 2 (Vendor sync + import updates):
└── Task 5: Run vendor sync, update all skill imports [unspecified-high]

Wave 3 (Skill directory renames — 4 parallel batches):
├── Task 6: Rename skill dirs batch A (7 skills) + update marketplace.json [unspecified-high]
├── Task 7: Rename skill dirs batch B (6 skills) [unspecified-high]
├── Task 8: Rename skill dirs batch C (6 skills) [unspecified-high]
└── Task 9: Update cross-skill refs in SKILL.md bodies [unspecified-high]

Wave 4 (Runtime config — 2 parallel):
├── Task 10: Update runtime config paths (.baoyu-skills → .supercreator) [unspecified-high]
└── Task 11: Update environment variables (BAOYU_* → SC_*) [unspecified-high]

Wave 5 (Docs + metadata — 5 parallel):
├── Task 12: Update CLAUDE.md + docs/*.md [quick]
├── Task 13: Update README.md + README.zh.md (incl. fork attribution) [quick]
├── Task 14: Update root package.json + all homepage/repository URLs [quick]
├── Task 15: Update SKILL.md front matter for all skills [unspecified-high]
└── Task 16: Add CHANGELOG entry + regenerate lockfile + final verification [quick]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Task 1 → Tasks 2-4 → Task 5 → Tasks 6-8 → Task 10 → Task 16 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 5 (Wave 5)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 2-4 | 0 |
| 2 | 1 | 5 | 1 |
| 3 | 1 | 5 | 1 |
| 4 | 1 | 5 | 1 |
| 5 | 2,3,4 | 6,7,8,9 | 2 |
| 6 | 5 | 9,10,11 | 3 |
| 7 | 5 | 9,10,11 | 3 |
| 8 | 5 | 9,10,11 | 3 |
| 9 | 5 | 10,11 | 3 |
| 10 | 6,7,8,9 | 16 | 4 |
| 11 | 6,7,8,9 | 16 | 4 |
| 12 | 6,7,8,9 | 16 | 5 |
| 13 | 6,7,8,9 | 16 | 5 |
| 14 | 6,7,8,9 | 16 | 5 |
| 15 | 6,7,8,9 | 16 | 5 |
| 16 | 10,11,12,13,14,15 | F1-F4 | 5 |
| F1-F4 | 16 | — | FINAL |

### Agent Dispatch Summary

- **Wave 0**: **1** — T1 → `quick`
- **Wave 1**: **3** — T2-T4 → `unspecified-high`
- **Wave 2**: **1** — T5 → `unspecified-high`
- **Wave 3**: **4** — T6-T9 → `unspecified-high`
- **Wave 4**: **2** — T10-T11 → `unspecified-high`
- **Wave 5**: **5** — T12-T14 → `quick`, T15 → `unspecified-high`, T16 → `quick`
- **FINAL**: **4** — F1 → `oracle`, F2-F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Delete deprecated baoyu-image-gen skill

  **What to do**:
  - 删除整个 `skills/baoyu-image-gen/` 目录（`rm -rf skills/baoyu-image-gen`）
  - 从 `.claude-plugin/marketplace.json` 的 `plugins[0].skills` 数组中移除 `"./skills/baoyu-image-gen"` 条目
  - 从 `CLAUDE.md` 中移除 Deprecated Skills 表格中 `baoyu-image-gen` 的条目
  - 从 `docs/image-generation.md` 中移除任何 `baoyu-image-gen` 引用
  - 删除 `skills/baoyu-imagine/scripts/main.ts` 中的 `migrateLegacyExtendConfig()` 函数及其调用（该函数用于从 baoyu-image-gen 迁移到 baoyu-imagine，不再需要）

  **Must NOT do**:
  - 不得修改 CHANGELOG 中关于 baoyu-image-gen 的历史条目
  - 不得删除或修改 `skills/baoyu-imagine/` 的任何其他逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的删除操作 + 几个配置文件的引用移除
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 0 (solo)
  - **Blocks**: Tasks 2, 3, 4
  - **Blocked By**: None

  **References**:
  - `skills/baoyu-image-gen/` — 要删除的整个目录
  - `.claude-plugin/marketplace.json` — skills 数组中有 `"./skills/baoyu-image-gen"` 条目需移除
  - `skills/baoyu-imagine/scripts/main.ts` — 包含 `migrateLegacyExtendConfig()` 函数，搜索该函数名定位并删除
  - `CLAUDE.md` — Deprecated Skills 表格，搜索 `baoyu-image-gen` 定位
  - `docs/image-generation.md` — 可能引用 baoyu-image-gen，用 grep 确认

  **Acceptance Criteria**:
  - [ ] `ls skills/baoyu-image-gen` → "No such file or directory"
  - [ ] `grep -r 'baoyu-image-gen' .claude-plugin/marketplace.json` → 无输出
  - [ ] `grep 'migrateLegacyExtendConfig' skills/baoyu-imagine/scripts/main.ts` → 无输出
  - [ ] `npm test` → 通过

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Deprecated skill fully removed
    Tool: Bash
    Preconditions: Repository at current state
    Steps:
      1. ls skills/baoyu-image-gen 2>&1 — expect error "No such file or directory"
      2. grep -c 'baoyu-image-gen' .claude-plugin/marketplace.json — expect "0"
      3. grep -c 'migrateLegacyExtendConfig' skills/baoyu-imagine/scripts/main.ts — expect "0"
      4. npm test — expect exit code 0
    Expected Result: All 4 checks pass
    Failure Indicators: Directory still exists, marketplace still references it, migration function still present, tests fail
    Evidence: .sisyphus/evidence/task-1-deprecated-removed.txt

  Scenario: CHANGELOG historical entries preserved
    Tool: Bash
    Preconditions: After deletion
    Steps:
      1. grep -c 'baoyu-image-gen' CHANGELOG.md — expect ≥1 (historical entries remain)
    Expected Result: Historical entries untouched
    Failure Indicators: Count is 0 (entries were wrongly deleted)
    Evidence: .sisyphus/evidence/task-1-changelog-preserved.txt
  ```

  **Commit**: YES
  - Message: `chore: delete deprecated baoyu-image-gen skill`
  - Files: `skills/baoyu-image-gen/`, `.claude-plugin/marketplace.json`, `skills/baoyu-imagine/scripts/main.ts`, `CLAUDE.md`, `docs/image-generation.md`
  - Pre-commit: `npm test`

- [x] 2. Rename package baoyu-md → sc-md

  **What to do**:
  - `git mv packages/baoyu-md packages/sc-md`
  - 更新 `packages/sc-md/package.json` 中的 `"name"` 字段：`"baoyu-md"` → `"sc-md"`
  - 在 `packages/sc-md/` 内所有 TypeScript 源码中，搜索并替换所有内部引用 `baoyu-md` → `sc-md`（如有）
  - 更新 `packages/sc-md/src/extend-config.ts` 中硬编码的 `"baoyu-markdown-to-html"` 路径（此处引用了 skill 名，暂时保留为 TODO 注释或用当前名——将在 Task 10 统一处理运行时路径）
  - 运行 `bun install` 更新 workspace 解析

  **Must NOT do**:
  - 不得修改 vendor 副本（Task 5 统一处理）
  - 不得修改 workspace glob `"packages/*"`
  - 不得修改任何运行时逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要精确的文件重命名 + package.json 更新 + workspace 重新解析
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 3, 4)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:
  - `packages/baoyu-md/package.json` — `"name": "baoyu-md"` 字段需更新
  - `packages/baoyu-md/src/extend-config.ts` — 包含 `".baoyu-skills"` 和 `"baoyu-markdown-to-html"` 路径引用（运行时路径将在 Task 10 处理）
  - Root `package.json` — workspace 配置使用 `"packages/*"` glob，不需要修改

  **Acceptance Criteria**:
  - [ ] `ls packages/sc-md/package.json` → 存在
  - [ ] `ls packages/baoyu-md/ 2>&1` → "No such file or directory"
  - [ ] `grep '"name"' packages/sc-md/package.json` → 包含 `"sc-md"`
  - [ ] `bun install` 成功，`npm test` 通过（packages/sc-md 下的测试）

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Package renamed and workspace resolves
    Tool: Bash
    Preconditions: Task 1 completed
    Steps:
      1. ls packages/sc-md/package.json — expect file exists
      2. ls packages/baoyu-md 2>&1 — expect "No such file or directory"
      3. node -e "const p=require('./packages/sc-md/package.json'); console.log(p.name)" — expect "sc-md"
      4. npm test 2>&1 | grep -E 'pass|fail' | tail -5 — expect pass, 0 failures
    Expected Result: Package successfully renamed, tests pass
    Failure Indicators: Old directory exists, package.json has old name, tests fail
    Evidence: .sisyphus/evidence/task-2-sc-md-rename.txt

  Scenario: No residual baoyu-md references in package source
    Tool: Bash
    Preconditions: After rename
    Steps:
      1. grep -rn 'baoyu-md' packages/sc-md/ --include='*.ts' --include='*.json' — expect no output (or only expected runtime path references handled in Task 10)
    Expected Result: Zero unexpected references
    Evidence: .sisyphus/evidence/task-2-sc-md-residuals.txt
  ```

  **Commit**: YES (groups with Tasks 3, 4 — one commit for all package renames)
  - Message: `refactor: rename workspace packages to sc-* prefix`
  - Files: `packages/sc-md/`
  - Pre-commit: `npm test`

- [x] 3. Rename package baoyu-fetch → sc-fetch

  **What to do**:
  - `git mv packages/baoyu-fetch packages/sc-fetch`
  - 更新 `packages/sc-fetch/package.json` 中的 `"name"` 字段：`"baoyu-fetch"` → `"sc-fetch"`
  - 更新 `packages/sc-fetch/package.json` 中的 `"bin"` 字段（如果 bin 名包含 `baoyu`）
  - 在 `packages/sc-fetch/` 内所有 TypeScript 源码中，搜索替换 `baoyu-fetch` → `sc-fetch`（如有）
  - 更新 `packages/sc-fetch/src/browser/profile.ts` 中的 `appDataDirName = "baoyu-skills"` 引用（暂标记 TODO — Task 10 统一处理）
  - 运行 `bun install` 更新 workspace 解析

  **Must NOT do**:
  - 不得修改 vendor 副本（Task 5 统一处理）
  - 不得修改运行时路径逻辑（Task 10 处理）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 同 Task 2
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 4)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:
  - `packages/baoyu-fetch/package.json` — `"name": "baoyu-fetch"` 和可能的 `"bin"` 字段
  - `packages/baoyu-fetch/src/browser/profile.ts` — `appDataDirName = "baoyu-skills"` 运行时路径（Task 10 处理）
  - `packages/baoyu-fetch/README.md` — 可能包含品牌引用

  **Acceptance Criteria**:
  - [ ] `ls packages/sc-fetch/package.json` → 存在
  - [ ] `ls packages/baoyu-fetch/ 2>&1` → "No such file or directory"
  - [ ] `grep '"name"' packages/sc-fetch/package.json` → 包含 `"sc-fetch"`
  - [ ] `npm test` 通过

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Package renamed and workspace resolves
    Tool: Bash
    Preconditions: Task 1 completed
    Steps:
      1. ls packages/sc-fetch/package.json — expect file exists
      2. ls packages/baoyu-fetch 2>&1 — expect "No such file or directory"
      3. node -e "const p=require('./packages/sc-fetch/package.json'); console.log(p.name)" — expect "sc-fetch"
      4. npm test 2>&1 | grep -E 'pass|fail' | tail -5 — expect pass
    Expected Result: Package renamed, tests pass
    Evidence: .sisyphus/evidence/task-3-sc-fetch-rename.txt
  ```

  **Commit**: YES (groups with Tasks 2, 4)
  - Message: `refactor: rename workspace packages to sc-* prefix`
  - Files: `packages/sc-fetch/`
  - Pre-commit: `npm test`

- [x] 4. Rename package baoyu-chrome-cdp → sc-chrome-cdp

  **What to do**:
  - `git mv packages/baoyu-chrome-cdp packages/sc-chrome-cdp`
  - 更新 `packages/sc-chrome-cdp/package.json` 中的 `"name"` 字段：`"baoyu-chrome-cdp"` → `"sc-chrome-cdp"`
  - 在 `packages/sc-chrome-cdp/` 内所有 TypeScript 源码中，搜索替换 `baoyu-chrome-cdp` → `sc-chrome-cdp`
  - 更新 `packages/sc-chrome-cdp/src/index.ts` 中的 `appDataDirName = "baoyu-skills"` 引用（暂标记 TODO — Task 10 统一处理）
  - 运行 `bun install` 更新 workspace 解析

  **Must NOT do**:
  - 不得修改 vendor 副本（Task 5 统一处理）
  - 不得修改运行时路径逻辑（Task 10 处理）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 同 Task 2
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:
  - `packages/baoyu-chrome-cdp/package.json` — `"name": "baoyu-chrome-cdp"` 字段
  - `packages/baoyu-chrome-cdp/src/index.ts` — `appDataDirName = "baoyu-skills"` 运行时路径（Task 10 处理）
  - `packages/baoyu-chrome-cdp/src/index.test.ts` — 测试中可能有 `BAOYU_*` 环境变量引用（Task 11 处理）

  **Acceptance Criteria**:
  - [ ] `ls packages/sc-chrome-cdp/package.json` → 存在
  - [ ] `ls packages/baoyu-chrome-cdp/ 2>&1` → "No such file or directory"
  - [ ] `grep '"name"' packages/sc-chrome-cdp/package.json` → 包含 `"sc-chrome-cdp"`
  - [ ] `npm test` 通过

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Package renamed and workspace resolves
    Tool: Bash
    Preconditions: Task 1 completed
    Steps:
      1. ls packages/sc-chrome-cdp/package.json — expect file exists
      2. ls packages/baoyu-chrome-cdp 2>&1 — expect "No such file or directory"
      3. node -e "const p=require('./packages/sc-chrome-cdp/package.json'); console.log(p.name)" — expect "sc-chrome-cdp"
      4. npm test 2>&1 | grep -E 'pass|fail' | tail -5 — expect pass
    Expected Result: Package renamed, tests pass
    Evidence: .sisyphus/evidence/task-4-sc-chrome-cdp-rename.txt
  ```

  **Commit**: YES (groups with Tasks 2, 3)
  - Message: `refactor: rename workspace packages to sc-* prefix`
  - Files: `packages/sc-chrome-cdp/`
  - Pre-commit: `npm test`

- [x] 5. Sync vendors and update all skill import statements

  **What to do**:
  - 运行 `node scripts/sync-shared-skill-packages.mjs --repo-root .` 让同步脚本自动用 `packages/sc-*` 的新内容重新生成所有 vendored 副本
  - 验证同步脚本按 glob (`packages/*`) 而非硬编码名称发现包——如果脚本报错，手动更新 vendored 副本目录名：
    - `skills/*/scripts/vendor/baoyu-md/` → `skills/*/scripts/vendor/sc-md/`
    - `skills/*/scripts/vendor/baoyu-fetch/` → `skills/*/scripts/vendor/sc-fetch/`
    - `skills/*/scripts/vendor/baoyu-chrome-cdp/` → `skills/*/scripts/vendor/sc-chrome-cdp/`
  - 更新所有 `skills/*/scripts/package.json` 中的 `"file:./vendor/baoyu-*"` 依赖引用：
    - `"baoyu-md": "file:./vendor/baoyu-md"` → `"sc-md": "file:./vendor/sc-md"`
    - `"baoyu-fetch": "file:./vendor/baoyu-fetch"` → `"sc-fetch": "file:./vendor/sc-fetch"`
    - `"baoyu-chrome-cdp": "file:./vendor/baoyu-chrome-cdp"` → `"sc-chrome-cdp": "file:./vendor/sc-chrome-cdp"`
  - 更新所有 TypeScript import 语句：
    - `from "baoyu-md"` → `from "sc-md"`
    - `from "baoyu-fetch"` → `from "sc-fetch"`
    - `from "baoyu-chrome-cdp"` → `from "sc-chrome-cdp"`
    - 使用 `ast_grep_search` + `ast_grep_replace` 进行安全的 AST 级别替换
  - 运行 `bun install` 在每个涉及的 skill 的 `scripts/` 目录中

  **Must NOT do**:
  - 不得修改 vendor 同步脚本 (`sync-shared-skill-packages.mjs`) 的逻辑
  - 不得手动编辑 vendor 内的源码文件（同步脚本会从 packages/ 复制）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 涉及多个 skill 目录的 vendor 更新 + 批量 import 替换，需要仔细验证
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (solo — must run after all 3 package renames complete)
  - **Blocks**: Tasks 6, 7, 8, 9
  - **Blocked By**: Tasks 2, 3, 4

  **References**:
  - `scripts/sync-shared-skill-packages.mjs` — vendor 同步脚本，读取 packages/* 目录并复制到 skills/*/scripts/vendor/
  - `scripts/lib/shared-skill-packages.test.ts` — 测试 vendor 同步逻辑
  - `skills/baoyu-url-to-markdown/scripts/package.json` — 示例：含 `"baoyu-fetch": "file:./vendor/baoyu-fetch"` 依赖
  - `skills/baoyu-markdown-to-html/scripts/package.json` — 示例：含 `"baoyu-md": "file:./vendor/baoyu-md"` 依赖
  - `skills/baoyu-danger-gemini-web/scripts/package.json` — 示例：含 `"baoyu-chrome-cdp": "file:./vendor/baoyu-chrome-cdp"` 依赖

  **Acceptance Criteria**:
  - [ ] `grep -rn '"baoyu-' skills/*/scripts/package.json` → 无输出
  - [ ] `grep -rn 'from "baoyu-' skills/ --include='*.ts'` → 无输出
  - [ ] `ls skills/*/scripts/vendor/ | grep baoyu` → 无输出
  - [ ] `node scripts/sync-shared-skill-packages.mjs --repo-root . --enforce-clean` → exit code 0
  - [ ] `npm test` → 通过

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: All vendor copies use new package names
    Tool: Bash
    Preconditions: Tasks 2-4 completed (packages renamed)
    Steps:
      1. grep -rn '"baoyu-' skills/*/scripts/package.json — expect no output
      2. find skills -path '*/vendor/baoyu-*' -type d — expect no output
      3. grep -rn 'from "baoyu-' skills/ --include='*.ts' — expect no output
      4. node scripts/sync-shared-skill-packages.mjs --repo-root . --enforce-clean — expect exit code 0
      5. npm test — expect pass
    Expected Result: All vendor refs updated, sync clean, tests pass
    Failure Indicators: Old vendor dirs exist, old import statements remain, sync script fails
    Evidence: .sisyphus/evidence/task-5-vendor-sync.txt

  Scenario: Import resolution works at runtime
    Tool: Bash
    Preconditions: After all updates
    Steps:
      1. Pick skills/baoyu-markdown-to-html/scripts/ as test subject
      2. cd into that dir, run bun install
      3. Verify node -e "require('sc-md')" does not throw
    Expected Result: Module resolves correctly
    Evidence: .sisyphus/evidence/task-5-import-resolution.txt
  ```

  **Commit**: YES
  - Message: `refactor: sync vendors and update skill imports to sc-* packages`
  - Files: `skills/*/scripts/vendor/`, `skills/*/scripts/package.json`, `skills/*/scripts/**/*.ts`
  - Pre-commit: `npm test`

- [x] 6. Rename skill directories batch A (7 skills) + update marketplace.json

  **What to do**:
  - 使用 `git mv` 重命名以下 7 个 skill 目录（去掉 `baoyu-` 前缀）：
    - `skills/baoyu-imagine` → `skills/imagine`
    - `skills/baoyu-comic` → `skills/comic`
    - `skills/baoyu-article-illustrator` → `skills/article-illustrator`
    - `skills/baoyu-cover-image` → `skills/cover-image`
    - `skills/baoyu-compress-image` → `skills/compress-image`
    - `skills/baoyu-infographic` → `skills/infographic`
    - `skills/baoyu-slide-deck` → `skills/slide-deck`
  - 更新 `.claude-plugin/marketplace.json` 中 `plugins[0].skills` 数组里所有 19 个 skill 的路径（全部从 `"./skills/baoyu-*"` 改为 `"./skills/*"`）
  - 同时更新 `plugins[0].name`：`"baoyu-skills"` → `"supercreator"`
  - 注意：marketplace.json 的所有路径更改在此 task 一次性完成（包括 batch B、C 的路径），因为 marketplace.json 是单文件

  **Must NOT do**:
  - 不得修改 SKILL.md 内容（Task 15 处理）
  - 不得修改任何 TypeScript 源码

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 批量目录重命名 + marketplace 配置更新
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8, 9)
  - **Blocks**: Tasks 10, 11, 12, 13, 14, 15
  - **Blocked By**: Task 5

  **References**:
  - `.claude-plugin/marketplace.json` — 权威 skill 注册表，`plugins[0].skills` 数组列出所有 skill 路径，`plugins[0].name` 是插件名
  - 当前 marketplace.json 中的完整 skill 列表（19 个，排除已删除的 baoyu-image-gen）

  **Acceptance Criteria**:
  - [ ] 7 个目录成功重命名，旧目录不存在
  - [ ] `cat .claude-plugin/marketplace.json | grep baoyu` → 无输出
  - [ ] marketplace.json 中 plugin name 为 `"supercreator"`

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Batch A directories renamed, marketplace updated
    Tool: Bash
    Preconditions: Task 5 completed
    Steps:
      1. ls skills/imagine skills/comic skills/article-illustrator skills/cover-image skills/compress-image skills/infographic skills/slide-deck — all exist
      2. ls skills/baoyu-imagine 2>&1 — expect "No such file or directory"
      3. grep 'baoyu' .claude-plugin/marketplace.json — expect no output
      4. node -e "const m=require('./.claude-plugin/marketplace.json'); console.log(m.plugins[0].name)" — expect "supercreator"
    Expected Result: All 7 dirs renamed, marketplace fully updated
    Evidence: .sisyphus/evidence/task-6-batch-a-rename.txt

  Scenario: Marketplace paths match actual directories
    Tool: Bash
    Preconditions: After rename
    Steps:
      1. node -e "const m=require('./.claude-plugin/marketplace.json'); m.plugins[0].skills.forEach(s => { const fs=require('fs'); if(!fs.existsSync(s)) console.log('MISSING:', s) })" — expect no output
    Expected Result: Every path in marketplace.json exists on disk
    Evidence: .sisyphus/evidence/task-6-marketplace-paths.txt
  ```

  **Commit**: YES (groups with Tasks 7, 8)
  - Message: `refactor: rename all skill directories, remove baoyu- prefix`
  - Files: `skills/*/`, `.claude-plugin/marketplace.json`
  - Pre-commit: `npm test`

- [x] 7. Rename skill directories batch B (6 skills)

  **What to do**:
  - 使用 `git mv` 重命名以下 6 个 skill 目录：
    - `skills/baoyu-post-to-wechat` → `skills/post-to-wechat`
    - `skills/baoyu-post-to-weibo` → `skills/post-to-weibo`
    - `skills/baoyu-post-to-x` → `skills/post-to-x`
    - `skills/baoyu-markdown-to-html` → `skills/markdown-to-html`
    - `skills/baoyu-format-markdown` → `skills/format-markdown`
    - `skills/baoyu-translate` → `skills/translate`

  **Must NOT do**:
  - 不得修改 marketplace.json（Task 6 已处理）
  - 不得修改 SKILL.md 内容（Task 15 处理）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 8, 9)
  - **Blocks**: Tasks 10, 11
  - **Blocked By**: Task 5

  **References**:
  - 这 6 个 skill 目录各自包含 SKILL.md、scripts/、references/ 等子目录

  **Acceptance Criteria**:
  - [ ] 6 个目录成功重命名，旧目录不存在
  - [ ] `npm test` 通过

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Batch B directories renamed
    Tool: Bash
    Steps:
      1. ls skills/post-to-wechat skills/post-to-weibo skills/post-to-x skills/markdown-to-html skills/format-markdown skills/translate — all exist
      2. ls skills/baoyu-post-to-wechat 2>&1 — expect "No such file or directory"
    Expected Result: All 6 dirs renamed
    Evidence: .sisyphus/evidence/task-7-batch-b-rename.txt
  ```

  **Commit**: YES (groups with Tasks 6, 8)
  - Message: `refactor: rename all skill directories, remove baoyu- prefix`
  - Pre-commit: `npm test`

- [x] 8. Rename skill directories batch C (6 skills)

  **What to do**:
  - 使用 `git mv` 重命名以下 6 个 skill 目录：
    - `skills/baoyu-url-to-markdown` → `skills/url-to-markdown`
    - `skills/baoyu-xhs-images` → `skills/xhs-images`
    - `skills/baoyu-youtube-transcript` → `skills/youtube-transcript`
    - `skills/baoyu-danger-gemini-web` → `skills/danger-gemini-web`
    - `skills/baoyu-danger-x-to-markdown` → `skills/danger-x-to-markdown`

  注意：只有 5 个 skill（baoyu-imagine 在 batch A 中）。如果 batch A 还没完成，此 task 可独立执行目录重命名。

  **Must NOT do**:
  - 不得修改 marketplace.json（Task 6 已处理）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7, 9)
  - **Blocks**: Tasks 10, 11
  - **Blocked By**: Task 5

  **References**:
  - 这 5 个 skill 目录各自包含 SKILL.md、scripts/、references/ 等子目录

  **Acceptance Criteria**:
  - [ ] 5 个目录成功重命名，旧目录不存在
  - [ ] `npm test` 通过

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Batch C directories renamed
    Tool: Bash
    Steps:
      1. ls skills/url-to-markdown skills/xhs-images skills/youtube-transcript skills/danger-gemini-web skills/danger-x-to-markdown — all exist
      2. ls skills/baoyu-url-to-markdown 2>&1 — expect "No such file or directory"
    Expected Result: All 5 dirs renamed
    Evidence: .sisyphus/evidence/task-8-batch-c-rename.txt
  ```

  **Commit**: YES (groups with Tasks 6, 7)
  - Message: `refactor: rename all skill directories, remove baoyu- prefix`
  - Pre-commit: `npm test`

- [x] 9. Update cross-skill references in SKILL.md bodies and scripts

  **What to do**:
  - 搜索所有 `skills/*/SKILL.md` body 中对其他 skill 的引用，更新路径：
    - `baoyu-post-to-wechat` → `post-to-wechat`（出现在 markdown-to-html 的 EXTEND.md 引用中）
    - `baoyu-format-markdown` → `format-markdown`（出现在 markdown-to-html 的推荐中）
    - `baoyu-imagine` → `imagine`（可能出现在 docs/引用中）
    - `/baoyu-*` CLI 命令引用 → `/skill-name`（如 `/baoyu-imagine` → `/imagine`）
  - 搜索 `skills/*/scripts/**/*.ts` 中硬编码的 skill 名引用并更新
  - 搜索 `skills/*/SKILL.md` 中对 vendored CLI 工具名的引用（如 `baoyu-fetch` CLI 用法）并更新为 `sc-fetch`

  **Must NOT do**:
  - 不得修改 SKILL.md 的 YAML front matter（Task 15 处理）
  - 不得修改运行时路径（Task 10 处理）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要全面搜索跨 skill 引用并精确替换
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7, 8)
  - **Blocks**: Tasks 10, 11
  - **Blocked By**: Task 5

  **References**:
  - `skills/baoyu-markdown-to-html/SKILL.md` — 引用 `baoyu-post-to-wechat` EXTEND.md 作为备用主题源，引用 `baoyu-format-markdown` 做 CJK 格式化
  - `skills/baoyu-url-to-markdown/SKILL.md` — 可能引用 `baoyu-fetch` CLI 用法
  - 所有 SKILL.md 中的 `## 使用` 或 `## Usage` 段落 — 搜索 `/baoyu-` 开头的 CLI 命令

  **Acceptance Criteria**:
  - [ ] `grep -rn 'baoyu-' skills/*/SKILL.md | grep -v '^---' | grep -v 'front matter'` — 仅剩 YAML front matter 中的引用（Task 15 处理）
  - [ ] `npm test` → 通过

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Cross-skill references updated
    Tool: Bash
    Steps:
      1. grep -rn 'baoyu-post-to-wechat' skills/markdown-to-html/SKILL.md — expect "post-to-wechat" (without baoyu prefix)
      2. grep -rn 'baoyu-format-markdown' skills/markdown-to-html/SKILL.md — expect no output
      3. grep -rn '/baoyu-' skills/*/SKILL.md — expect no output (CLI commands updated)
    Expected Result: All cross-references use new names
    Evidence: .sisyphus/evidence/task-9-cross-refs.txt
  ```

  **Commit**: YES (groups with Tasks 6-8)
  - Message: `refactor: rename all skill directories, remove baoyu- prefix`
  - Pre-commit: `npm test`

- [x] 10. Update runtime config paths (.baoyu-skills → .supercreator)

  **What to do**:
  - 搜索并替换所有 TypeScript 源码中的运行时配置路径 `.baoyu-skills` → `.supercreator`：
    - `packages/sc-md/src/extend-config.ts` — `".baoyu-skills"` 出现在 EXTEND.md 路径构造中（`~/.baoyu-skills/<skill>/EXTEND.md` 和 `.baoyu-skills/<skill>/EXTEND.md`）
    - `skills/imagine/scripts/main.ts` — `".baoyu-skills"` 出现在 EXTEND.md 和 .env 路径构造中
    - `skills/imagine/scripts/main.test.ts` — 测试中的路径期望值
    - `skills/post-to-wechat/scripts/wechat-extend-config.ts` — `.baoyu-skills` 路径
    - `skills/post-to-wechat/scripts/wechat-extend-config.test.ts` — 测试中的路径期望值
    - `skills/post-to-wechat/scripts/wechat-api.ts` — `.baoyu-skills` 路径（.env 加载）
    - `skills/post-to-wechat/scripts/check-permissions.ts` — `.baoyu-skills` 路径
    - `skills/post-to-wechat/scripts/cdp.ts` — `.baoyu-skills` 路径
  - 同步更新 vendor 中的副本（3 个 vendor 中的 extend-config.ts 会由 Task 5 的 vendor sync 覆盖，但验证是否干净）：
    - `skills/markdown-to-html/scripts/vendor/sc-md/src/extend-config.ts`
    - `skills/post-to-weibo/scripts/vendor/sc-md/src/extend-config.ts`
    - `skills/post-to-wechat/scripts/vendor/sc-md/src/extend-config.ts`
  - 更新 `packages/sc-fetch/src/browser/profile.ts` 中的 `appDataDirName = "baoyu-skills"` → `"supercreator"`
  - 更新 `packages/sc-chrome-cdp/src/index.ts` 中的 `appDataDirName = "baoyu-skills"` → `"supercreator"`
  - 更新 `skills/danger-gemini-web/scripts/gemini-webapi/utils/paths.ts` 和 `load-browser-cookies.ts` 中的 `.baoyu-skills` 路径
  - 更新 `skills/danger-x-to-markdown/scripts/paths.ts` 中的 `.baoyu-skills` 路径
  - 更新 `skills/post-to-x/scripts/x-utils.ts` 中的 `.baoyu-skills` 路径
  - 更新 `skills/post-to-weibo/scripts/weibo-utils.ts` 中的 `.baoyu-skills` 路径
  - 再次运行 vendor sync 确保 vendor 副本一致：`node scripts/sync-shared-skill-packages.mjs --repo-root . --enforce-clean`
  - 更新 `packages/sc-md/src/extend-config.ts` 中硬编码的 skill 名引用（如 `"baoyu-markdown-to-html"` → `"markdown-to-html"`）

  **Must NOT do**:
  - 不得添加向后兼容 fallback 逻辑（全新品牌，干净切换）
  - 不得重构路径构造逻辑
  - 不得修改 .env 文件格式或加载逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 涉及多个文件的运行时路径替换，需要精确定位和验证
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 11)
  - **Blocks**: Task 16
  - **Blocked By**: Tasks 6, 7, 8, 9

  **References**:
  - `packages/sc-md/src/extend-config.ts` — 路径构造函数，搜索 `.baoyu-skills` 和硬编码 skill 名如 `baoyu-markdown-to-html`
  - `packages/sc-fetch/src/browser/profile.ts` — `appDataDirName = "baoyu-skills"` Chrome profile 路径
  - `packages/sc-chrome-cdp/src/index.ts` — `appDataDirName = "baoyu-skills"` Chrome profile 路径
  - `skills/imagine/scripts/main.ts` — `.baoyu-skills` 在 EXTEND.md 和 .env 路径构造
  - `skills/post-to-wechat/scripts/wechat-extend-config.ts` — `.baoyu-skills` 路径构造
  - `skills/danger-gemini-web/scripts/gemini-webapi/utils/paths.ts` — `.baoyu-skills` cookies/config 路径
  - `skills/danger-x-to-markdown/scripts/paths.ts` — `.baoyu-skills` 路径
  - `scripts/sync-shared-skill-packages.mjs` — vendor sync 验证命令

  **Acceptance Criteria**:
  - [ ] `grep -rn '\.baoyu-skills' --include='*.ts' . | grep -v node_modules | grep -v .sisyphus | grep -v CHANGELOG` → 无输出
  - [ ] `grep -rn '"baoyu-skills"' --include='*.ts' . | grep -v node_modules | grep -v .sisyphus` → 无输出
  - [ ] `node scripts/sync-shared-skill-packages.mjs --repo-root . --enforce-clean` → exit code 0
  - [ ] `npm test` → 通过

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: All runtime config paths updated to .supercreator
    Tool: Bash
    Preconditions: Tasks 6-9 completed (skill dirs renamed)
    Steps:
      1. grep -rn '\.baoyu-skills' --include='*.ts' . | grep -v node_modules | grep -v .sisyphus | grep -v CHANGELOG — expect no output
      2. grep -rn '"baoyu-skills"' --include='*.ts' . | grep -v node_modules | grep -v .sisyphus — expect no output
      3. grep -rn 'appDataDirName.*baoyu' --include='*.ts' . | grep -v node_modules — expect no output
      4. npm test — expect pass
    Expected Result: Zero runtime path references to baoyu-skills
    Failure Indicators: Any grep returns matches, tests fail
    Evidence: .sisyphus/evidence/task-10-runtime-paths.txt

  Scenario: Vendor copies consistent after path updates
    Tool: Bash
    Preconditions: After path updates
    Steps:
      1. node scripts/sync-shared-skill-packages.mjs --repo-root . --enforce-clean — expect exit code 0
    Expected Result: Vendor sync passes clean
    Failure Indicators: Sync script reports dirty state
    Evidence: .sisyphus/evidence/task-10-vendor-sync.txt
  ```

  **Commit**: YES (groups with Task 11)
  - Message: `refactor: update runtime config paths and env vars to supercreator`
  - Files: All files listed above
  - Pre-commit: `npm test`

- [x] 11. Update environment variables (BAOYU_* → SC_*)

  **What to do**:
  - 搜索并替换所有 TypeScript 源码中的 `BAOYU_` 环境变量前缀 → `SC_`：
    - `skills/imagine/scripts/main.ts` — `BAOYU_IMAGE_GEN_MAX_WORKERS`, `BAOYU_IMAGE_GEN_${provider}_CONCURRENCY`, `BAOYU_IMAGE_GEN_${provider}_START_INTERVAL_MS`（注意模板字符串）
    - `skills/imagine/scripts/main.test.ts` — 测试中的环境变量名期望值
    - `packages/sc-fetch/src/cli.ts` — `BAOYU_CHROME_PROFILE_DIR` 环境变量
    - `packages/sc-fetch/src/browser/profile.ts` — `BAOYU_CHROME_PROFILE_DIR` 环境变量
    - `packages/sc-fetch/src/__tests__/profile.test.ts` — 测试中的环境变量名
    - `packages/sc-chrome-cdp/src/index.test.ts` — `BAOYU_CHROME_PROFILE_DIR` 测试
    - `skills/danger-gemini-web/scripts/gemini-webapi/utils/load-browser-cookies.ts` — `BAOYU_CHROME_PROFILE_DIR`
    - `skills/post-to-wechat/scripts/cdp.ts` — `BAOYU_CHROME_PROFILE_DIR`
    - `skills/post-to-x/scripts/x-utils.ts` — `BAOYU_CHROME_PROFILE_DIR`
    - `skills/post-to-weibo/scripts/weibo-utils.ts` — `BAOYU_CHROME_PROFILE_DIR`
  - 注意 `BAOYU_IMAGE_GEN_${provider}_CONCURRENCY` 中的模板字符串构造——替换前缀 `BAOYU_IMAGE_GEN` → `SC_IMAGE_GEN`
  - 更新相应的 vendor 副本中的环境变量引用（或运行 vendor sync 覆盖）
  - 运行 vendor sync 确保一致
  - 更新测试文件中的环境变量名期望值

  **Must NOT do**:
  - 不得添加向后兼容 fallback 逻辑
  - 不得修改环境变量的读取逻辑（只改名）
  - 不得修改 .env 文件本身（那是用户的配置文件，在文档中说明即可）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 涉及精确的环境变量名替换，包括模板字符串中的动态构造
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 10)
  - **Blocks**: Task 16
  - **Blocked By**: Tasks 6, 7, 8, 9

  **References**:
  - `skills/imagine/scripts/main.ts` — 搜索 `BAOYU_IMAGE_GEN` 定位所有环境变量引用，注意 `\`SC_IMAGE_GEN_${provider.toUpperCase()}_CONCURRENCY\`` 这样的模板字符串
  - `packages/sc-fetch/src/browser/profile.ts` — `BAOYU_CHROME_PROFILE_DIR` 环境变量引用
  - `packages/sc-chrome-cdp/src/index.test.ts` — 测试 `BAOYU_CHROME_PROFILE_DIR` 的行为
  - `packages/sc-fetch/src/__tests__/profile.test.ts` — 测试 `BAOYU_CHROME_PROFILE_DIR` 的行为

  **Acceptance Criteria**:
  - [ ] `grep -rn 'BAOYU_' --include='*.ts' . | grep -v node_modules | grep -v .sisyphus | grep -v CHANGELOG | grep -v baoyu-image-gen` → 无输出
  - [ ] `npm test` → 通过（环境变量名在测试中也更新了）

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: All BAOYU_ env var references replaced with SC_
    Tool: Bash
    Preconditions: Tasks 6-9 completed
    Steps:
      1. grep -rn 'BAOYU_' --include='*.ts' . | grep -v node_modules | grep -v .sisyphus | grep -v CHANGELOG — expect no output
      2. grep -rn 'SC_IMAGE_GEN' skills/imagine/scripts/main.ts — expect ≥3 matches (MAX_WORKERS, CONCURRENCY template, START_INTERVAL template)
      3. grep -rn 'SC_CHROME_PROFILE_DIR' packages/sc-fetch/src/browser/profile.ts — expect ≥1 match
      4. npm test — expect pass
    Expected Result: All env vars use SC_ prefix, tests pass with new names
    Failure Indicators: BAOYU_ still found, SC_ not present, tests fail
    Evidence: .sisyphus/evidence/task-11-env-vars.txt

  Scenario: Template string env vars correctly renamed
    Tool: Bash
    Preconditions: After env var rename
    Steps:
      1. grep -n 'SC_IMAGE_GEN.*CONCURRENCY' skills/imagine/scripts/main.ts — expect template string like `SC_IMAGE_GEN_${...}_CONCURRENCY`
      2. grep -n 'SC_IMAGE_GEN.*START_INTERVAL' skills/imagine/scripts/main.ts — expect template string
    Expected Result: Dynamic env var construction uses SC_ prefix
    Evidence: .sisyphus/evidence/task-11-template-strings.txt
  ```

  **Commit**: YES (groups with Task 10)
  - Message: `refactor: update runtime config paths and env vars to supercreator`
  - Files: All files listed above
  - Pre-commit: `npm test`

- [x] 12. Update CLAUDE.md + docs/*.md references

  **What to do**:
  - Update `CLAUDE.md`: Replace all `baoyu-skills` → `supercreator`, `baoyu-` prefix → prefix-less or `sc-` for packages, `.baoyu-skills` → `.supercreator`, `BAOYU_` → `SC_`, `JimLiu/baoyu-skills` → `hl85/supercreator`
  - Update `docs/creating-skills.md` (16 matches): Replace `baoyu-` prefix requirement with no-prefix convention, update all example references
  - Update `docs/chrome-profile.md` (5 matches): Replace `.baoyu-skills` → `.supercreator`, `baoyu-skills` → `supercreator`
  - Update `docs/comic-style-maintenance.md` (4 matches): Replace `baoyu-comic` → `comic`
  - Update `docs/image-generation.md` (3 matches): Replace `baoyu-imagine` → `imagine`, `BAOYU_IMAGE_GEN` → `SC_IMAGE_GEN`
  - Update `docs/publishing.md` (3 matches): Replace `baoyu-` skill references with prefix-less names

  **Must NOT do**:
  - Do not modify any non-markdown files
  - Do not change the substantive content or instructions, only brand references
  - Do not add extra commentary or "updated by" annotations

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward text substitution across 6 markdown files with known patterns
  - **Skills**: `[]`
    - No specialized skills needed for markdown text replacement
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed — no git operations in this task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 13, 14, 15, 16)
  - **Blocks**: None (final verification only)
  - **Blocked By**: Tasks 1-11 (all naming changes must be settled first)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References**:
  - `CLAUDE.md` — Current developer guide, contains `baoyu-skills` plugin name, `.baoyu-skills/` paths, `BAOYU_CHROME_PROFILE_DIR` env var, `baoyu-` prefix rule, `baoyu-imagine` default, `baoyu-image-gen` deprecation note
  - `docs/creating-skills.md` — Skill creation guide with 16 `baoyu` references: prefix naming convention, example paths, marketplace references
  - `docs/chrome-profile.md` — Chrome profile paths containing `.baoyu-skills` directory references
  - `docs/comic-style-maintenance.md` — Comic style guide referencing `baoyu-comic` skill
  - `docs/image-generation.md` — Image gen guide referencing `baoyu-imagine` and `BAOYU_IMAGE_GEN` env vars
  - `docs/publishing.md` — ClawHub publishing guide referencing `baoyu-*` skill directories

  **Naming Mapping** (apply consistently):
  - `baoyu-skills` → `supercreator`
  - `baoyu-xxx` (skill name) → `xxx` (drop prefix)
  - `.baoyu-skills/` → `.supercreator/`
  - `BAOYU_` → `SC_`
  - `JimLiu/baoyu-skills` → `hl85/supercreator`
  - `baoyu-md` / `baoyu-fetch` / `baoyu-chrome-cdp` → `sc-md` / `sc-fetch` / `sc-chrome-cdp`
  - Remove "All skills MUST use `baoyu-` prefix" rule from CLAUDE.md (no prefix required anymore)
  - Update `baoyu-image-gen` deprecation note to reference `imagine` (not `baoyu-imagine`)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Zero baoyu references remain in CLAUDE.md and docs/
    Tool: Bash
    Preconditions: After all replacements applied
    Steps:
      1. grep -rni 'baoyu' CLAUDE.md docs/ — expect 0 matches
      2. grep -ni 'supercreator' CLAUDE.md — expect ≥5 matches (plugin name, config dir, etc.)
      3. grep -ni '\.supercreator' docs/chrome-profile.md — expect ≥1 match (config path)
      4. grep -ni 'SC_' docs/image-generation.md — expect ≥1 match (env var)
    Expected Result: Zero baoyu references, all replaced with supercreator/sc- equivalents
    Failure Indicators: Any grep match for 'baoyu' in step 1
    Evidence: .sisyphus/evidence/task-12-docs-grep.txt

  Scenario: CLAUDE.md prefix rule updated
    Tool: Bash
    Preconditions: After CLAUDE.md updated
    Steps:
      1. grep -n 'MUST use.*baoyu.*prefix' CLAUDE.md — expect 0 matches
      2. grep -n 'baoyu-image-gen' CLAUDE.md — expect 0 matches (deprecation note updated)
      3. grep -n 'imagine' CLAUDE.md — expect ≥1 match (updated deprecation reference)
    Expected Result: Old prefix rule removed, deprecation note references `imagine` not `baoyu-imagine`
    Evidence: .sisyphus/evidence/task-12-claude-md-rules.txt
  ```

  **Commit**: YES (groups with Tasks 13, 14, 15)
  - Message: `refactor: update docs, README, and SKILL.md references to supercreator`
  - Files: `CLAUDE.md`, `docs/*.md`
  - Pre-commit: `grep -rni 'baoyu' CLAUDE.md docs/` (expect 0)

- [ ] 13. Update README.md + README.zh.md with fork attribution

  **What to do**:
  - **README.md** (extremely large file — hundreds of `baoyu` references): Perform systematic replacement across ALL sections:
    - Plugin name: `baoyu-skills` → `supercreator`
    - GitHub org/repo: `JimLiu/baoyu-skills` → `hl85/supercreator`
    - All skill command names: `/baoyu-xxx` → `/xxx` (e.g., `/baoyu-imagine` → `/imagine`)
    - All skill directory names: `baoyu-xxx` → `xxx`
    - Config directories: `.baoyu-skills/` → `.supercreator/`
    - Package references: `baoyu-md` → `sc-md`, `baoyu-fetch` → `sc-fetch`, `baoyu-chrome-cdp` → `sc-chrome-cdp`
    - Environment variables: `BAOYU_IMAGE_GEN_MAX_WORKERS` → `SC_IMAGE_GEN_MAX_WORKERS`, `BAOYU_IMAGE_GEN_<PROVIDER>_CONCURRENCY` → `SC_IMAGE_GEN_<PROVIDER>_CONCURRENCY`, `BAOYU_IMAGE_GEN_<PROVIDER>_START_INTERVAL_MS` → `SC_IMAGE_GEN_<PROVIDER>_START_INTERVAL_MS`, `BAOYU_CHROME_PROFILE_DIR` → `SC_CHROME_PROFILE_DIR`
    - ClawHub install examples: `clawhub install baoyu-imagine` → `clawhub install imagine`
    - Plugin install commands: `/plugin install baoyu-skills@baoyu-skills` → `/plugin install supercreator@supercreator`
    - Star History chart URL: `JimLiu/baoyu-skills` → `hl85/supercreator`
    - Screenshot paths: `./screenshots/` references stay as-is (file content doesn't change)
  - **README.zh.md**: Apply identical replacements (Chinese version mirrors English)
  - **Add fork attribution** to BOTH READMEs — insert after the title/description, before Prerequisites:
    ```markdown
    > **Fork Notice**: This project is forked from [JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills). Original work by [@JimLiu](https://github.com/JimLiu).
    ```
  - **Update Credits section**: Keep existing credits, do NOT remove JimLiu attribution from fork notice

  **Must NOT do**:
  - Do not modify screenshot image files or paths (only text references)
  - Do not change the structure or ordering of sections
  - Do not remove any existing Credits entries
  - Do not add extra explanatory text beyond the fork attribution line
  - Do not miss ANY occurrence — README has hundreds of references

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Text substitution, but in a very large file — requires thoroughness. The patterns are mechanical and well-defined.
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 12, 14, 15, 16)
  - **Blocks**: None
  - **Blocked By**: Tasks 1-11

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References**:
  - `README.md` — Full file, hundreds of `baoyu` references across: title, install commands, plugin table, all 19 skill sections, environment config section, customization section, disclaimer, credits, star history
  - `README.zh.md` — Chinese mirror of README.md, same structure and reference patterns

  **Naming Mapping** (same as Task 12, plus):
  - Skill section headers: `#### baoyu-xxx` → `#### xxx`
  - Command examples: `/baoyu-xxx` → `/xxx`
  - Install examples: `npx skills add jimliu/baoyu-skills` → `npx skills add hl85/supercreator`
  - Plugin marketplace: `/plugin marketplace add JimLiu/baoyu-skills` → `/plugin marketplace add hl85/supercreator`
  - "Skills shared by Baoyu" → updated description (propose: "AI-powered content generation skills for Claude Code")
  - Star History: `repos=JimLiu/baoyu-skills` → `repos=hl85/supercreator`

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Zero baoyu references remain in READMEs
    Tool: Bash
    Preconditions: After all replacements
    Steps:
      1. grep -cni 'baoyu' README.md — expect 0
      2. grep -cni 'baoyu' README.zh.md — expect 0
      3. grep -c 'supercreator' README.md — expect ≥20 (many references)
      4. grep -c 'JimLiu/baoyu-skills' README.md — expect exactly 1 (fork attribution only)
    Expected Result: All baoyu references replaced except the fork attribution link
    Failure Indicators: grep count > 0 in steps 1-2 (excluding fork attribution grep in step 4)
    Evidence: .sisyphus/evidence/task-13-readme-grep.txt

  Scenario: Fork attribution present in both READMEs
    Tool: Bash
    Preconditions: After README updates
    Steps:
      1. grep -n 'Fork Notice' README.md — expect 1 match near top of file
      2. grep -n 'JimLiu/baoyu-skills' README.md — expect exactly in fork notice line
      3. grep -n 'Fork Notice' README.zh.md — expect 1 match
    Expected Result: Fork attribution block present in both files
    Failure Indicators: Missing fork notice in either file
    Evidence: .sisyphus/evidence/task-13-fork-attribution.txt

  Scenario: Skill command names and install commands updated
    Tool: Bash
    Preconditions: After README updates
    Steps:
      1. grep -n '/baoyu-' README.md — expect 0 matches (all skill commands updated)
      2. grep -n 'clawhub install imagine' README.md — expect ≥1 match
      3. grep -n '/plugin install supercreator' README.md — expect ≥1 match
      4. grep -n 'SC_IMAGE_GEN' README.md — expect ≥2 matches (env var table)
    Expected Result: All commands use new naming
    Evidence: .sisyphus/evidence/task-13-commands-check.txt
  ```

  **Commit**: YES (groups with Tasks 12, 14, 15)
  - Message: `refactor: update docs, README, and SKILL.md references to supercreator`
  - Files: `README.md`, `README.zh.md`
  - Pre-commit: `grep -cni 'baoyu' README.md README.zh.md` (expect only fork attribution hits)

- [ ] 14. Update root package.json + all homepage/repository URLs

  **What to do**:
  - **Root `package.json`**: Update `name` field from `baoyu-skills` → `supercreator`; update `repository.url`, `homepage`, `bugs.url` to point to `hl85/supercreator`
  - **`packages/sc-md/package.json`** (renamed in Task 4): Verify/update `name` → `sc-md`, `repository.url` → `hl85/supercreator`, `homepage` → `hl85/supercreator`
  - **`packages/sc-fetch/package.json`** (renamed in Task 4): Same updates for `sc-fetch`
  - **`packages/sc-chrome-cdp/package.json`** (renamed in Task 4): Same updates for `sc-chrome-cdp`
  - **All `skills/*/scripts/package.json`** that contain repository/homepage URLs: Update to `hl85/supercreator`
  - **All vendor `package.json` files** inside `skills/*/scripts/packages/*/package.json`: These are copies synced by `scripts/sync-shared-skill-packages.mjs` — update their `name` fields to match the renamed packages (`sc-md`, `sc-fetch`, `sc-chrome-cdp`) and URLs to `hl85/supercreator`
  - Note: vendor copies will be re-synced by Task 8, but URLs in the source packages must be correct first

  **Must NOT do**:
  - Do not change version numbers
  - Do not modify dependency version ranges
  - Do not change package.json structure or add new fields

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: JSON field updates across known files — mechanical substitution
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 12, 13, 15, 16)
  - **Blocks**: None
  - **Blocked By**: Tasks 1-11 (especially Task 4 for package renames)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References**:
  - `package.json` (root) — Contains `name: "baoyu-skills"`, `repository.url` with `JimLiu/baoyu-skills`, `homepage`, `bugs.url`
  - `packages/sc-md/package.json` (post Task 4 rename) — Package name and URLs
  - `packages/sc-fetch/package.json` (post Task 4 rename) — Package name and URLs
  - `packages/sc-chrome-cdp/package.json` (post Task 4 rename) — Package name and URLs

  **Files to grep** (find all affected package.json files):
  - Run: `grep -rn 'baoyu\|JimLiu' --include='package.json' .` to find all remaining references after earlier tasks

  **Naming Mapping**:
  - Root package name: `baoyu-skills` → `supercreator`
  - Repository URL: `github.com/JimLiu/baoyu-skills` → `github.com/hl85/supercreator`
  - Package names: `baoyu-md` → `sc-md`, `baoyu-fetch` → `sc-fetch`, `baoyu-chrome-cdp` → `sc-chrome-cdp`

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Zero baoyu/JimLiu references in any package.json
    Tool: Bash
    Preconditions: After all package.json updates
    Steps:
      1. grep -rn 'baoyu' --include='package.json' . — expect 0 matches
      2. grep -rn 'JimLiu' --include='package.json' . — expect 0 matches
      3. cat package.json | grep '"name"' — expect "supercreator"
      4. cat packages/sc-md/package.json | grep '"name"' — expect "sc-md"
    Expected Result: All package.json files reference supercreator/hl85/sc-* names
    Failure Indicators: Any baoyu or JimLiu match in step 1-2
    Evidence: .sisyphus/evidence/task-14-package-json.txt

  Scenario: Repository URLs consistently point to hl85/supercreator
    Tool: Bash
    Preconditions: After updates
    Steps:
      1. grep -rn 'repository' --include='package.json' . | grep -v 'hl85/supercreator' | grep -v node_modules — expect 0 matches (all point to new repo)
      2. grep -rn 'homepage' --include='package.json' . | grep -v 'hl85/supercreator' | grep -v node_modules — expect 0 or only empty homepage fields
    Expected Result: All URLs point to new repository
    Evidence: .sisyphus/evidence/task-14-urls.txt
  ```

  **Commit**: YES (groups with Tasks 12, 13, 15)
  - Message: `refactor: update docs, README, and SKILL.md references to supercreator`
  - Files: All `package.json` files
  - Pre-commit: `grep -rn 'baoyu\|JimLiu' --include='package.json' .` (expect 0)

- [ ] 15. Update all SKILL.md front matter and body references

  **What to do**:
  - Update ALL 19 active `skills/*/SKILL.md` files (266 total `baoyu` references):
    - **YAML front matter**: `name:` field — remove `baoyu-` prefix (e.g., `name: baoyu-imagine` → `name: imagine`)
    - **YAML front matter**: `homepage:` field — update URL from `JimLiu/baoyu-skills` to `hl85/supercreator`
    - **Body text**: Replace all `baoyu-xxx` skill name references with prefix-less `xxx`
    - **Body text**: Replace `/baoyu-xxx` command references with `/xxx`
    - **Body text**: Replace `baoyu-skills` with `supercreator`
    - **Body text**: Replace `.baoyu-skills/` config paths with `.supercreator/`
    - **Body text**: Replace `BAOYU_` env var prefixes with `SC_`
    - **Body text**: Replace `baoyu-md` / `baoyu-fetch` / `baoyu-chrome-cdp` with `sc-md` / `sc-fetch` / `sc-chrome-cdp`
  - **Specific high-count files** (prioritize careful review):
    - `skills/post-to-wechat/SKILL.md` — 27 matches (most in repo)
    - `skills/imagine/SKILL.md` — 25 matches (env vars, provider logic)
    - `skills/post-to-x/SKILL.md` — 21 matches
    - `skills/translate/SKILL.md` — 19 matches
    - `skills/url-to-markdown/SKILL.md` — 17 matches
    - `skills/danger-gemini-web/SKILL.md` — 16 matches
  - Cross-reference: Ensure skill names in SKILL.md match the actual directory names (post Task 2 renames)

  **Must NOT do**:
  - Do not change SKILL.md file structure or add new sections
  - Do not modify non-brand-related content (skill logic, examples, parameters)
  - Do not change version numbers in front matter

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 19 files, 266 replacements — needs thoroughness and systematic approach. Not a trivial quick task.
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed — no git operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 12, 13, 14, 16)
  - **Blocks**: None
  - **Blocked By**: Tasks 1-11 (especially Task 2 for directory renames — SKILL.md files must be in their new locations)

  **References** (CRITICAL - Be Exhaustive):

  **Files to update** (all 19 active SKILL.md files, post Task 2 directory renames):
  - `skills/imagine/SKILL.md` (25 matches)
  - `skills/post-to-wechat/SKILL.md` (27 matches)
  - `skills/post-to-x/SKILL.md` (21 matches)
  - `skills/translate/SKILL.md` (19 matches)
  - `skills/url-to-markdown/SKILL.md` (17 matches)
  - `skills/danger-gemini-web/SKILL.md` (16 matches)
  - `skills/xhs-images/SKILL.md`
  - `skills/infographic/SKILL.md`
  - `skills/cover-image/SKILL.md`
  - `skills/slide-deck/SKILL.md`
  - `skills/comic/SKILL.md`
  - `skills/article-illustrator/SKILL.md`
  - `skills/post-to-weibo/SKILL.md`
  - `skills/youtube-transcript/SKILL.md`
  - `skills/danger-x-to-markdown/SKILL.md`
  - `skills/compress-image/SKILL.md`
  - `skills/format-markdown/SKILL.md`
  - `skills/markdown-to-html/SKILL.md`
  - `skills/trending-on-x/SKILL.md`

  **Naming Mapping** (same as all tasks — apply consistently):
  - Front matter `name: baoyu-xxx` → `name: xxx`
  - Front matter `homepage:` → `https://github.com/hl85/supercreator`
  - Body: `/baoyu-xxx` → `/xxx`
  - Body: `baoyu-skills` → `supercreator`
  - Body: `.baoyu-skills/` → `.supercreator/`
  - Body: `BAOYU_` → `SC_`
  - Body: `baoyu-md` → `sc-md`, `baoyu-fetch` → `sc-fetch`, `baoyu-chrome-cdp` → `sc-chrome-cdp`

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Zero baoyu references in any SKILL.md
    Tool: Bash
    Preconditions: After all SKILL.md updates
    Steps:
      1. grep -rn 'baoyu' skills/*/SKILL.md — expect 0 matches
      2. grep -rn 'baoyu' skills/*/SKILL.md | wc -l — expect 0
      3. grep -c 'supercreator\|/imagine\|/comic\|/translate' skills/imagine/SKILL.md — expect ≥3
    Expected Result: All 266 references replaced, zero baoyu remaining
    Failure Indicators: Any match in step 1
    Evidence: .sisyphus/evidence/task-15-skill-md-grep.txt

  Scenario: YAML front matter name fields match directory names
    Tool: Bash
    Preconditions: After updates
    Steps:
      1. For each skills/*/SKILL.md, extract `name:` from front matter
      2. Verify it matches the directory name (e.g., skills/imagine/SKILL.md has `name: imagine`)
      3. Verify `homepage:` contains `hl85/supercreator`
    Expected Result: All 19 SKILL.md name fields match their parent directory name
    Failure Indicators: Mismatch between directory name and front matter name
    Evidence: .sisyphus/evidence/task-15-frontmatter-check.txt

  Scenario: High-count files fully cleaned
    Tool: Bash
    Preconditions: After updates to top-6 highest-count files
    Steps:
      1. grep -c 'baoyu' skills/post-to-wechat/SKILL.md — expect 0
      2. grep -c 'baoyu' skills/imagine/SKILL.md — expect 0
      3. grep -c 'baoyu' skills/post-to-x/SKILL.md — expect 0
      4. grep -c 'baoyu' skills/translate/SKILL.md — expect 0
    Expected Result: All high-count files have 0 remaining baoyu references
    Evidence: .sisyphus/evidence/task-15-high-count-check.txt
  ```

  **Commit**: YES (groups with Tasks 12, 13, 14)
  - Message: `refactor: update docs, README, and SKILL.md references to supercreator`
  - Files: All `skills/*/SKILL.md`
  - Pre-commit: `grep -rn 'baoyu' skills/*/SKILL.md` (expect 0)

- [ ] 16. CHANGELOG entry + regenerate lockfile + final full-repo verification

  **What to do**:
  - **CHANGELOG.md**: Add new entry at the TOP (do NOT modify existing entries):
    ```markdown
    ## [Unreleased]

    ### Changed
    - Renamed project from `baoyu-skills` to `supercreator` (forked from [JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills))
    - Removed `baoyu-` prefix from all skill directories
    - Renamed workspace packages: `baoyu-md` → `sc-md`, `baoyu-fetch` → `sc-fetch`, `baoyu-chrome-cdp` → `sc-chrome-cdp`
    - Updated runtime config directory: `.baoyu-skills/` → `.supercreator/`
    - Updated environment variable prefix: `BAOYU_*` → `SC_*`
    - Deleted deprecated `baoyu-image-gen` skill

    ### Removed
    - `baoyu-image-gen` (deprecated, migrated to `imagine`)
    ```
  - **CHANGELOG.zh.md**: Add equivalent Chinese entry at the TOP
  - **Fix Git remote URL**: Run `git remote set-url origin git@github.com:hl85/supercreator.git` (current remote has typo: `suppercreator` with double p)
  - **Regenerate lockfile**: Run `bun install` to regenerate `bun.lockb` / `bun.lock` with new package names
  - **Final full-repo verification**: Run comprehensive grep to confirm ZERO remaining `baoyu` references across entire codebase (excluding `.git/`, `node_modules/`, and `bun.lockb`)
  - **Marketplace verification**: Validate `marketplace.json` skill paths match actual directories on disk

  **Must NOT do**:
  - Do not modify existing CHANGELOG entries (only add new entry at top)
  - Do not run `npm install` — use `bun install` only (Bun project)
  - Do not manually edit the lockfile

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: CHANGELOG edit is simple, lockfile regen is one command, final grep is verification
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed — no git operations in this task

  **Parallelization**:
  - **Can Run In Parallel**: YES (partially — CHANGELOG can parallel, lockfile regen must come after all package.json changes)
  - **Parallel Group**: Wave 5 (with Tasks 12, 13, 14, 15) — but `bun install` step should run AFTER Tasks 12-15 complete
  - **Blocks**: Final Verification Wave (F1-F4)
  - **Blocked By**: Tasks 1-15 (all code changes must be done before final verification)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References**:
  - `CHANGELOG.md` — Current changelog format (check existing entry structure to match style)
  - `CHANGELOG.zh.md` — Chinese changelog (mirror structure)
  - `bun.lockb` or `bun.lock` — Lockfile to regenerate

  **Verification Commands**:
  - `grep -rn 'baoyu' --include='*.ts' --include='*.js' --include='*.mjs' --include='*.json' --include='*.md' . | grep -v node_modules | grep -v '.git/' | grep -v 'bun.lockb'` — expect ONLY the fork attribution line(s) in README
  - `bun install` — expect clean install with no errors
  - `ls skills/*/SKILL.md | wc -l` — expect 19 (no more baoyu-image-gen)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: CHANGELOG entries added correctly
    Tool: Bash
    Preconditions: After CHANGELOG updates
    Steps:
      1. head -20 CHANGELOG.md — expect [Unreleased] section with rebrand changes
      2. grep 'supercreator' CHANGELOG.md — expect ≥1 match
      3. head -20 CHANGELOG.zh.md — expect equivalent Chinese entry
    Expected Result: Both changelogs have new entry at top
    Failure Indicators: Missing entry or wrong position
    Evidence: .sisyphus/evidence/task-16-changelog.txt

  Scenario: Git remote URL corrected
    Tool: Bash
    Preconditions: After remote fix
    Steps:
      1. git remote get-url origin — expect git@github.com:hl85/supercreator.git
      2. Verify NO double-p (suppercreator) in output
    Expected Result: Remote URL is correctly spelled
    Failure Indicators: URL still contains 'suppercreator'
    Evidence: .sisyphus/evidence/task-16-git-remote.txt

  Scenario: Lockfile regenerated cleanly
    Tool: Bash
    Preconditions: After bun install
    Steps:
      1. bun install — expect exit code 0
      2. Check bun.lockb or bun.lock exists and was modified recently
    Expected Result: Clean install with no errors, lockfile updated
    Failure Indicators: Install errors, missing packages, resolution failures
    Evidence: .sisyphus/evidence/task-16-bun-install.txt

  Scenario: ZERO baoyu references in entire codebase (final verification)
    Tool: Bash
    Preconditions: ALL tasks 1-15 complete
    Steps:
      1. grep -rn 'baoyu' --include='*.ts' --include='*.js' --include='*.mjs' --include='*.json' --include='*.md' --include='*.yaml' --include='*.yml' . | grep -v node_modules | grep -v '.git/' | grep -v 'bun.lockb' — count matches
      2. Expected: Only fork attribution line(s) in README.md and README.zh.md (1-2 matches each, inside the Fork Notice blockquote)
      3. Any OTHER match = FAILURE — report file:line for investigation
    Expected Result: ≤4 total matches, all in README fork attribution
    Failure Indicators: Any match outside README fork attribution
    Evidence: .sisyphus/evidence/task-16-final-grep.txt

  Scenario: Marketplace.json paths match actual directories
    Tool: Bash
    Preconditions: After all renames
    Steps:
      1. Extract all skill paths from .claude-plugin/marketplace.json
      2. For each path, verify the directory exists on disk: ls skills/{name}/SKILL.md
      3. Verify no baoyu-image-gen entry remains
    Expected Result: All marketplace paths resolve to real directories, no stale entries
    Evidence: .sisyphus/evidence/task-16-marketplace-verify.txt
  ```

  **Commit**: YES (final commit of the rebrand)
  - Message: `refactor: add CHANGELOG entries for rebrand, regenerate lockfile`
  - Files: `CHANGELOG.md`, `CHANGELOG.zh.md`, `bun.lockb` (or `bun.lock`)
  - Pre-commit: `bun install && grep -rn 'baoyu' --include='*.ts' --include='*.json' --include='*.md' . | grep -v node_modules | grep -v '.git/' | grep -v bun.lock | grep -v 'Fork Notice' | wc -l` (expect 0)

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm test`. Review changed files for: dangling imports, broken `file:` references in package.json, inconsistent naming (some baoyu remaining). Check all TypeScript files compile. Verify no `as any` or `@ts-ignore` added.
  Output: `Tests [N pass/N fail] | Imports [CLEAN/N issues] | Naming [CLEAN/N residuals] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Run `npm test` from clean state. Run `node scripts/sync-shared-skill-packages.mjs --repo-root . --enforce-clean`. Grep entire repo for "baoyu" — verify only CHANGELOG historical entries + README fork attribution remain. Verify marketplace.json paths match actual directories. Verify all SKILL.md `name:` fields match directory names.
  Output: `Tests [PASS/FAIL] | Vendor Sync [PASS/FAIL] | Residuals [N expected/N unexpected] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

Each commit must leave repo in passing-tests state:

| Phase | Commit | Message | Files | Pre-commit check |
|-------|--------|---------|-------|-----------------|
| 0 | C0 | `chore: delete deprecated baoyu-image-gen skill` | `skills/baoyu-image-gen/` | `npm test` |
| 1 | C1 | `refactor: rename workspace packages to sc-* prefix` | `packages/sc-*` | `npm test` |
| 2 | C2 | `refactor: sync vendors and update skill imports` | `skills/*/scripts/vendor/`, `skills/*/scripts/package.json` | `npm test` |
| 3 | C3 | `refactor: rename all skill directories, remove baoyu- prefix` | `skills/*`, `.claude-plugin/marketplace.json` | `npm test` |
| 4 | C4 | `refactor: update runtime config paths and env vars` | runtime TS files | `npm test` |
| 5 | C5 | `docs: rebrand to supercreator, add fork attribution` | `*.md`, `package.json`, `SKILL.md` files | `npm test` |
| 5 | C6 | `chore: regenerate lockfile after rebrand` | `bun.lockb` | `npm test` |

---

## Success Criteria

### Verification Commands
```bash
npm test                    # Expected: all 48 test files pass, exit code 0
ls skills/ | grep baoyu     # Expected: no output
grep -rn 'baoyu' --include='*.ts' --include='*.js' --include='*.json' . | grep -v CHANGELOG | grep -v .sisyphus | grep -v node_modules
                            # Expected: no output
node scripts/sync-shared-skill-packages.mjs --repo-root . --enforce-clean
                            # Expected: exit code 0
cat .claude-plugin/marketplace.json | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['plugins'][0]['name']=='supercreator'"
                            # Expected: no assertion error
grep -c 'JimLiu/baoyu-skills' README.md
                            # Expected: ≥1 (fork attribution present)
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All 48 test files pass
- [ ] Vendor sync clean
- [ ] Zero unexpected "baoyu" residuals
