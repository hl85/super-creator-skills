/**
 * sc-extend-config / x 适配器
 *
 * 占位符：在 M3-M4 中实现。
 */

import type { PlatformAdapter } from "../types.ts";

export const xAdapter: PlatformAdapter = {
  platform: "x",
  useParentRecursion: true,
  credentialFieldSets: [],
  perAliasEnv: false,
};
