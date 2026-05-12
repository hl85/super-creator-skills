# Social Publishing Architecture Refactoring

## 1. Background & Motivation
Following an analysis of the `agent-reach` skill, we identified advanced design patterns that can significantly improve the `super-creator` agent's operational efficiency and reliability. The current implementation of publishing skills (`post-to-x`, `post-to-wechat`, etc.) forces the agent to manage low-level details (e.g., path calculations, manual runtime resolution, verbose SKILL.md files). This refactoring adopts a **Domain-Driven, Intent-Based** approach featuring Progressive Disclosure, Semantic Abstraction, and Self-Healing Environments.

## 2. Scope & Impact
- **Affected Skills**: `post-to-x`, `post-to-weibo`, `post-to-wechat`, `multi-publish`.
- **New Infrastructure**: A centralized CLI wrapper (e.g., `packages/sc-cli` or similar shell abstraction) to hide script paths.
- **Documentation**: Extensive restructuring of `SKILL.md` into `references/*.md`.

## 3. Proposed Architecture (Decentralized CLI + References)
We will maintain the independence of platform skills (Bounded Contexts) while introducing cross-cutting abstractions.

- **Semantic Abstraction (The CLI Wrapper)**: Introduce a global command (e.g., `sc-run post-to-x x-browser --args`) that automatically resolves `{baseDir}` and the appropriate `bun`/`npx` runtime. The agent will no longer perform path math.
- **Progressive Disclosure**: `SKILL.md` files will be reduced to ~20-30 lines containing only Intent mappings and the base CLI command. All detailed parameters, troubleshooting, and platform quirks will be moved to `references/` (e.g., `references/video.md`, `references/articles.md`).
- **Self-Healing Infrastructure**: Standardize a `--check` flag across all social publishing scripts. Introduce automatic CDP port cleanup (auto-killing stale Chrome debugging ports) directly within the scripts, removing this burden from the agent's manual steps.

## 4. Implementation Plan & Sub-Agent Distribution
This plan is designed to be executed by parallel sub-agents using the `/subagent-driven-development` skill or `invoke_agent`.

### Phase 1: Infrastructure Layer (Sub-Agent 1)
- **Task**: Create the `sc-run` (or equivalent) abstraction.
- **Details**: Develop a lightweight wrapper script in the project root or `scripts/lib` that intercepts commands like `sc-run <skill-name> <script-name>`, calculates absolute paths dynamically, ensures the runtime is available, and forwards arguments.
- **DDD alignment**: Shared Kernel / Infrastructure layer.

### Phase 2: Domain Bounded Contexts (Parallel Execution)
These tasks can be executed concurrently once Phase 1 is defined.

- **Task A: Refactor `post-to-x` (Sub-Agent 2)**
  - Move detailed docs to `skills/post-to-x/references/`.
  - Update `SKILL.md` to use the new `sc-run` abstraction.
  - Implement self-healing CDP cleanup in `x-browser.ts` and `x-article.ts`.
  - Clean up outdated files.

- **Task B: Refactor `post-to-wechat` & `post-to-weibo` (Sub-Agent 3)**
  - Apply the exact same progressive disclosure pattern (`references/`).
  - Update their `SKILL.md` to use `sc-run`.
  - Integrate the self-healing CDP logic.

### Phase 3: Orchestration Update (Sub-Agent 4)
- **Task**: Update `multi-publish`.
- **Details**: Refactor `prompts/pipeline.md` and `prompts/platform-adapters.md` within `multi-publish` to orchestrate tasks using the new abstracted `sc-run` commands and the simplified platform references.

## 5. Verification & Testing
- Run `sc-run post-to-x --check` (or equivalent) to verify environment self-healing.
- Conduct a dry-run (draft mode) `multi-publish` invocation to ensure the orchestrator correctly interfaces with the refactored skills.

## 6. Migration & Cleanup
- Delete old boilerplate texts from all affected `SKILL.md` files.
- Ensure no orphaned script files remain.
