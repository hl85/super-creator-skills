import fs from "node:fs";
import path from "node:path";
import { createHmac, randomBytes } from "node:crypto";

const API_BASE = "https://api.x.com/2";
const UPLOAD_BASE = "https://upload.x.com/1.1/media/upload.json";

interface XApiCredentials {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

interface TweetResponse {
  data: {
    id: string;
    text: string;
  };
}

interface MediaUploadResponse {
  media_id_string: string;
  media_id: number;
  size: number;
  image?: {
    w: number;
    h: number;
    image_type: string;
  };
}

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}

function generateNonce(): string {
  return randomBytes(16).toString("base64url");
}

function generateTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

function buildOAuthSignature(
  method: string,
  baseUrl: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string,
): string {
  const allParams = { ...params };
  const sortedKeys = Object.keys(allParams).sort();
  const paramString = sortedKeys
    .map((k) => `${percentEncode(k)}=${percentEncode(allParams[k]!)}`)
    .join("&");

  const signatureBase =
    `${method.toUpperCase()}&${percentEncode(baseUrl)}&${percentEncode(paramString)}`;

  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;

  return createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");
}

function buildOAuthHeader(
  method: string,
  url: string,
  creds: XApiCredentials,
  additionalParams: Record<string, string> = {},
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: generateNonce(),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: generateTimestamp(),
    oauth_token: creds.accessToken,
    oauth_version: "1.0",
    ...additionalParams,
  };

  const allParams = { ...oauthParams };
  const signature = buildOAuthSignature(
    method,
    url,
    allParams,
    creds.apiSecret,
    creds.accessTokenSecret,
  );
  oauthParams.oauth_signature = signature;

  const sortedKeys = Object.keys(oauthParams).sort();
  const headerParts = sortedKeys
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k]!)}"`)
    .join(", ");

  return `OAuth ${headerParts}`;
}

async function uploadMedia(
  creds: XApiCredentials,
  imagePath: string,
): Promise<string> {
  const imageData = fs.readFileSync(imagePath);
  const filename = path.basename(imagePath);

  const initResponse = await oauthFetch(
    creds,
    "POST",
    `${UPLOAD_BASE}?command=INIT&total_bytes=${imageData.length}&media_type=image/png`,
  );
  if (!initResponse.ok) {
    throw new Error(`Media INIT failed: ${initResponse.status} ${await initResponse.text()}`);
  }
  const initData = (await initResponse.json()) as { media_id_string: string };
  const mediaId = initData.media_id_string;

  await oauthFetch(
    creds,
    "POST",
    `${UPLOAD_BASE}?command=APPEND&media_id=${mediaId}&segment_index=0`,
    imageData,
    "application/octet-stream",
  );

  const finalizeResponse = await oauthFetch(
    creds,
    "POST",
    `${UPLOAD_BASE}?command=FINALIZE&media_id=${mediaId}`,
  );
  if (!finalizeResponse.ok) {
    throw new Error(`Media FINALIZE failed: ${finalizeResponse.status} ${await finalizeResponse.text()}`);
  }

  return mediaId;
}

async function oauthFetch(
  creds: XApiCredentials,
  method: string,
  url: string,
  body?: string | Buffer,
  contentType?: string,
): Promise<Response> {
  const urlObj = new URL(url);
  const baseUrl = `${urlObj.origin}${urlObj.pathname}`;
  const queryParams: Record<string, string> = {};
  for (const [k, v] of urlObj.searchParams.entries()) {
    queryParams[k] = v;
  }

  const authHeader = buildOAuthHeader(method, baseUrl, creds, queryParams);

  const headers: Record<string, string> = {
    Authorization: authHeader,
  };
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return fetch(url, {
    method,
    headers,
    body: body || undefined,
  });
}

async function postTweet(
  creds: XApiCredentials,
  text: string,
  mediaIds?: string[],
): Promise<TweetResponse> {
  const body: Record<string, unknown> = { text };
  if (mediaIds && mediaIds.length > 0) {
    body.media = { media_ids: mediaIds };
  }

  const response = await oauthFetch(
    creds,
    "POST",
    `${API_BASE}/tweets`,
    JSON.stringify(body),
    "application/json",
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tweet failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as TweetResponse;
}

function parseArgs(args: string[]): {
  text: string;
  images: string[];
  check: boolean;
  account?: string;
  method?: "api" | "browser";
} {
  const result = {
    text: "",
    images: [] as string[],
    check: false,
    account: undefined as string | undefined,
    method: undefined as "api" | "browser" | undefined,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i]!;
    if (arg === "--image" || arg === "-i") {
      i++;
      if (args[i]) result.images.push(args[i]!);
    } else if (arg === "--account" || arg === "-a") {
      i++;
      if (args[i]) result.account = args[i];
    } else if (arg === "--method" || arg === "-m") {
      i++;
      if (args[i] === "browser" || args[i] === "api") result.method = args[i];
    } else if (arg === "--check") {
      result.check = true;
    } else if (!arg.startsWith("-")) {
      result.text = arg;
    }
    i++;
  }

  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const { text, images, check, account, method } = parseArgs(args);

  const { loadXExtendConfig, resolveAccount, hasApiCredentials, loadCredentials } =
    await import("./x-extend-config.ts");

  const config = loadXExtendConfig();
  const resolved = resolveAccount(config, account);
  const creds = {
    apiKey: resolved.api_key || "",
    apiSecret: resolved.api_secret || "",
    accessToken: resolved.access_token || "",
    accessTokenSecret: resolved.access_token_secret || "",
  };

  if (check) {
    const apiReady = hasApiCredentials(loadCredentials());
    console.log(`Publish method: ${method || resolved.default_publish_method}`);
    console.log(`API credentials: ${apiReady ? "✅ configured" : "❌ not found"}`);
    console.log(`Browser profile: ${resolved.chrome_profile_path || "default"}`);
    if (resolved.name) console.log(`Account: ${resolved.name}${resolved.alias ? ` (${resolved.alias})` : ""}`);
    process.exit(apiReady ? 0 : 1);
  }

  if (!text) {
    console.error("Error: Tweet text is required");
    console.log("Usage: x-api.ts <text> [--image path] [--account alias] [--check]");
    process.exit(1);
  }

  const useApi = method === "api" || (method !== "browser" && resolved.default_publish_method === "api");

  if (!useApi) {
    console.log("API mode not selected. Use --method api to force API mode.");
    process.exit(2);
  }

  if (!hasApiCredentials(creds as ReturnType<typeof import("./x-extend-config.ts").loadCredentials>)) {
    console.error("Error: API credentials not configured.");
    console.error("Set X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET env vars");
    console.error("Or configure in EXTEND.md under the x: section");
    process.exit(1);
  }

  try {
    const mediaIds: string[] = [];
    for (const imagePath of images) {
      const resolvedPath = path.resolve(imagePath);
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Image not found: ${resolvedPath}`);
      }
      console.log(`Uploading image: ${path.basename(resolvedPath)}...`);
      const mediaId = await uploadMedia(creds, resolvedPath);
      mediaIds.push(mediaId);
      console.log(`  → media_id: ${mediaId}`);
    }

    console.log("Posting tweet...");
    const result = await postTweet(creds, text, mediaIds);
    console.log(`✅ Tweet posted successfully!`);
    console.log(`   ID: ${result.data.id}`);
    console.log(`   URL: https://x.com/i/web/status/${result.data.id}`);
    console.log(`   Text: ${result.data.text.slice(0, 100)}${result.data.text.length > 100 ? "..." : ""}`);
  } catch (error) {
    console.error("❌ Failed to post tweet:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
