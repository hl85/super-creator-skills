import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface XAccount {
  name: string;
  alias: string;
  default?: boolean;
  default_publish_method?: "api" | "browser";
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  access_token_secret?: string;
  bearer_token?: string;
  chrome_profile_path?: string;
}

export interface XExtendConfig {
  default_publish_method?: "api" | "browser";
  chrome_profile_path?: string;
  accounts?: XAccount[];
}

export interface ResolvedXAccount {
  name?: string;
  alias?: string;
  default_publish_method: "api" | "browser";
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  access_token_secret?: string;
  bearer_token?: string;
  chrome_profile_path?: string;
}

function stripQuotes(s: string): string {
  return s.replace(/^['"]|['"]$/g, "");
}

function parseXExtend(content: string): XExtendConfig {
  const config: XExtendConfig = {};
  const lines = content.split("\n");
  let inAccounts = false;
  let current: Record<string, string> | null = null;
  const rawAccounts: Record<string, string>[] = [];

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed === "accounts:") {
      inAccounts = true;
      continue;
    }

    if (inAccounts) {
      const listMatch = raw.match(/^\s+-\s+(.+)$/);
      if (listMatch) {
        if (current) rawAccounts.push(current);
        current = {};
        const kv = listMatch[1]!;
        const ci = kv.indexOf(":");
        if (ci > 0) {
          current[kv.slice(0, ci).trim()] = stripQuotes(kv.slice(ci + 1).trim());
        }
        continue;
      }

      if (current && /^\s{2,}/.test(raw) && !trimmed.startsWith("-")) {
        const ci = trimmed.indexOf(":");
        if (ci > 0) {
          current[trimmed.slice(0, ci).trim()] = stripQuotes(trimmed.slice(ci + 1).trim());
        }
        continue;
      }

      if (!/^\s/.test(raw)) {
        if (current) rawAccounts.push(current);
        current = null;
        inAccounts = false;
      } else {
        continue;
      }
    }

    const ci = trimmed.indexOf(":");
    if (ci < 0) continue;
    const key = trimmed.slice(0, ci).trim();
    const val = stripQuotes(trimmed.slice(ci + 1).trim());
    if (val === "null" || val === "") continue;

    switch (key) {
      case "default_publish_method":
        config.default_publish_method = (val === "browser" ? "browser" : "api");
        break;
      case "chrome_profile_path":
        config.chrome_profile_path = val;
        break;
    }
  }

  if (current) rawAccounts.push(current);

  if (rawAccounts.length > 0) {
    config.accounts = rawAccounts.map(a => ({
      name: a.name || "",
      alias: a.alias || "",
      default: a.default === "true" || a.default === "1",
      default_publish_method: (a.default_publish_method === "browser" ? "browser" : "api") as "api" | "browser",
      api_key: a.api_key || undefined,
      api_secret: a.api_secret || undefined,
      access_token: a.access_token || undefined,
      access_token_secret: a.access_token_secret || undefined,
      bearer_token: a.bearer_token || undefined,
      chrome_profile_path: a.chrome_profile_path || undefined,
    }));
  }

  return config;
}

function findExtendFile(startDir: string): string | null {
  let dir = startDir;
  while (true) {
    const candidate = path.join(dir, "EXTEND.md");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export function loadXExtendConfig(cwd?: string): XExtendConfig {
  const workDir = cwd || process.cwd();
  const extendFile = findExtendFile(workDir);
  if (!extendFile) return {};
  try {
    const content = fs.readFileSync(extendFile, "utf-8");
    const xSection = extractXSection(content);
    return xSection ? parseXExtend(xSection) : {};
  } catch {
    return {};
  }
}

function extractXSection(content: string): string | null {
  const lines = content.split("\n");
  let inXSection = false;
  const xLines: string[] = [];
  let xIndent = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("x:") || trimmed.startsWith("post-to-x:")) {
      inXSection = true;
      xIndent = line.search(/\S/);
      continue;
    }

    if (inXSection) {
      if (!trimmed) {
        xLines.push("");
        continue;
      }
      const currentIndent = line.search(/\S/);
      if (currentIndent <= xIndent && trimmed && !trimmed.startsWith("#")) {
        break;
      }
      xLines.push(line.slice(xIndent + 2));
    }
  }

  return xLines.length > 0 ? xLines.join("\n") : null;
}

export function loadCredentials(account?: XAccount): {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
  bearerToken?: string;
} {
  const envBearer = process.env.X_BEARER_TOKEN
    || process.env.TWITTER_BEARER_TOKEN
    || process.env.X_API_TOKEN;

  const envApiKey = process.env.X_API_KEY
    || process.env.TWITTER_API_KEY
    || process.env.X_CONSUMER_KEY;

  const envApiSecret = process.env.X_API_SECRET
    || process.env.TWITTER_API_SECRET
    || process.env.X_CONSUMER_SECRET;

  const envAccessToken = process.env.X_ACCESS_TOKEN
    || process.env.TWITTER_ACCESS_TOKEN;

  const envAccessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET
    || process.env.TWITTER_ACCESS_TOKEN_SECRET;

  return {
    apiKey: account?.api_key || envApiKey,
    apiSecret: account?.api_secret || envApiSecret,
    accessToken: account?.access_token || envAccessToken,
    accessTokenSecret: account?.access_token_secret || envAccessTokenSecret,
    bearerToken: account?.bearer_token || envBearer,
  };
}

export function hasApiCredentials(creds: ReturnType<typeof loadCredentials>): boolean {
  return Boolean(
    (creds.apiKey && creds.apiSecret && creds.accessToken && creds.accessTokenSecret)
    || creds.bearerToken
  );
}

export function resolveAccount(config: XExtendConfig, alias?: string): ResolvedXAccount {
  const accounts = config.accounts || [];
  let account: XAccount | undefined;

  if (alias) {
    account = accounts.find(a => a.alias === alias || a.name === alias);
  }
  if (!account) {
    account = accounts.find(a => a.default) || accounts[0];
  }

  const creds = loadCredentials(account);
  const methodFromEnv = process.env.X_PUBLISH_METHOD;
  const defaultMethod: "api" | "browser" =
    methodFromEnv === "browser" ? "browser"
    : methodFromEnv === "api" ? "api"
    : account?.default_publish_method
    || config.default_publish_method
    || (hasApiCredentials(creds) ? "api" : "browser");

  return {
    name: account?.name,
    alias: account?.alias,
    default_publish_method: defaultMethod,
    api_key: creds.apiKey,
    api_secret: creds.apiSecret,
    access_token: creds.accessToken,
    access_token_secret: creds.accessTokenSecret,
    bearer_token: creds.bearerToken,
    chrome_profile_path: account?.chrome_profile_path || config.chrome_profile_path,
  };
}
