/**
 * sc-extend-config 类型定义
 *
 * 设计要点：
 * - BaseAccount / BaseExtendConfig 是所有平台账号的最小公约数
 * - PlatformAdapter 通过泛型 + 平台特定 schema 实现差异注入
 * - 凭据源用对象数组描述，便于报告与排错
 */

/** 平台字符串 */
export type Platform = "x" | "wechat" | "weibo" | "xhs";

/** 账号基础结构（所有平台的最小公约数） */
export interface BaseAccount {
  name: string;
  alias: string;
  default?: boolean;
  default_publish_method?: string;
  chrome_profile_path?: string;
  [key: string]: unknown;
}

/** 通用 Extend 配置（顶层） */
export interface BaseExtendConfig {
  default?: Record<string, unknown>;
  accounts?: BaseAccount[];
}

/** resolveAccount 返回的已选账号 */
export interface ResolvedAccount {
  name?: string;
  alias?: string;
  default_publish_method?: string;
  chrome_profile_path?: string;
  credentials: Record<string, string>;
  source: string;
  skippedSources?: string[];
  extras?: Record<string, unknown>;
}

/** 单个凭据源 */
export interface CredentialSource {
  name: string;
  fields: Record<string, string>;
  priority: number;
}

/** loadCredentials 的返回 */
export interface LoadedCredentials {
  credentials: Record<string, string>;
  source: string;
  skippedSources: string[];
}

/**
 * 平台适配器：所有平台差异通过此接口注入
 */
export interface PlatformAdapter<TConfig = unknown, TAccount extends BaseAccount = BaseAccount> {
  platform: Platform;
  /** 平台支持的 section 名称（如 ['x', 'post-to-x'] 兼容两种写法） */
  sectionNames?: string[];
  /** 是否使用父目录递归查找 EXTEND.md */
  useParentRecursion: boolean;
  /**
   * 凭据字段集合
   * 平台可有多套凭据方案（如 X 同时支持 OAuth 1.0a 四键 和 Bearer Token）
   */
  credentialFieldSets: Array<{ name: string; required: string[] }>;
  /** 是否按 alias 拼接 env 名称 */
  perAliasEnv: boolean;
  /** env 名称兼容映射（兼容历史名称，如 X→TWITTER_*） */
  envKeyMap?: Record<string, string>;
  /** .env 文件子目录名 */
  envSubdir?: string;
  /** 解析平台特定的全局配置 */
  parseConfig?: (raw: unknown) => TConfig;
  /** 解析平台特定的账号字段 */
  parseAccount?: (raw: BaseAccount) => TAccount;
  /** 从账号对象中提取内联凭据 */
  extractInlineCredentials?: (account: BaseAccount) => Record<string, string>;
}

/** loadExtendConfig 选项 */
export interface AdapterOptions {
  cwd?: string;
  recurseParent?: boolean;
  envPaths?: string[];
}

/** parser 输出 */
export interface ParseResult {
  default: Record<string, unknown>;
  accounts: BaseAccount[];
}
