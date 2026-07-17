/**
 * sc-extend-config / xhs 适配器
 *
 * 占位符：在 M3-M4 中实现。
 */

import type { PlatformAdapter } from "../types.ts";

export const xhsAdapter: PlatformAdapter = {
  platform: "xhs",
  useParentRecursion: false,
  credentialFieldSets: [],
  perAliasEnv: false,
};
