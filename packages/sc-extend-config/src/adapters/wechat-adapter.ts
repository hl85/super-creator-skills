/**
 * sc-extend-config / wechat 适配器
 *
 * 占位符：在 M3-M4 中实现。
 */

import type { PlatformAdapter } from "../types.ts";

export const wechatAdapter: PlatformAdapter = {
  platform: "wechat",
  useParentRecursion: false,
  credentialFieldSets: [],
  perAliasEnv: true,
};
