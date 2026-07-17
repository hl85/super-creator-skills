/**
 * sc-extend-config
 *
 * 通用 EXTEND.md 多账号配置包。
 * 为 post-to-x / post-to-wechat / post-to-weibo / post-to-xhs 等发布技能
 * 提供统一的多账号配置加载、账号选择、凭据解析能力。
 *
 * 核心 API:
 * - loadExtendConfig(adapter)        加载并解析 EXTEND.md
 * - resolveAccount(adapter, alias?)  选择账号（按 alias > default > accounts[0]）
 * - loadCredentials(adapter, account?) 解析凭据（含 source / skipped 报告）
 * - hasCredentials(adapter, creds)   凭据完整性检查
 *
 * v0.1 脚手架版本：仅完成包结构、类型定义、错误类型；业务逻辑在 M2-M5 实施。
 */

export type {
  Platform,
  BaseAccount,
  BaseExtendConfig,
  ResolvedAccount,
  LoadedCredentials,
  CredentialSource,
  PlatformAdapter,
  AdapterOptions,
  ParseResult,
} from "./types.ts";

export {
  MissingCredentialsError,
  InvalidExtendFileError,
  AmbiguousAccountError,
} from "./errors.ts";

export { parseExtendContent } from "./parser.ts";
export { findExtendFile } from "./locate.ts";
export { extractPlatformSection } from "./section.ts";
export { resolveAccount } from "./account.ts";
export { loadCredentials, hasCredentials } from "./credentials.ts";
export { loadEnvFile } from "./env-file.ts";
