#!/usr/bin/env node

import path from "node:path";

import {
  ensureManagedPathsClean,
  syncSharedSkillPackages,
} from "./lib/shared-skill-packages.mjs";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = path.resolve(options.repoRoot);
  const result = await syncSharedSkillPackages(repoRoot, {
    targets: options.targets,
  });

  if (options.enforceClean) {
    ensureManagedPathsClean(repoRoot, result.managedPaths);
  }

  console.log(`Synced shared workspace packages into ${result.packageDirs.length} skill script package(s).`);
}

function parseArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    enforceClean: false,
    targets: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root") {
      options.repoRoot = requireOptionValue(argv, index, "--repo-root");
      index += 1;
      continue;
    }
    if (arg === "--enforce-clean") {
      options.enforceClean = true;
      continue;
    }
    if (arg === "--target") {
      options.targets.push(requireOptionValue(argv, index, "--target"));
      index += 1;
      continue;
    }
    if (arg === "-h" || arg === "--help") {
      printUsage();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function requireOptionValue(argv, index, optionName) {
  const value = argv[index + 1];
  if (!value || value.startsWith("-")) {
    throw new Error(`${optionName} requires a value`);
  }
  return value;
}

function printUsage() {
  console.log(`Usage: sync-shared-skill-packages.mjs [options]

Options:
  --repo-root <dir>   Repository root (default: current directory)
  --target <dir>      Sync only one skill directory (can be repeated)
  --enforce-clean     Fail if managed files change after sync
  -h, --help          Show help`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
