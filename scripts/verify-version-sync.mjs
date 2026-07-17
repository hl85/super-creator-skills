#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

async function main() {
  const repoRoot = process.cwd();
  
  try {
    // Read primary version from marketplace.json
    const marketplaceJsonPath = path.join(repoRoot, ".claude-plugin/marketplace.json");
    const marketplaceJson = JSON.parse(
      await fs.readFile(marketplaceJsonPath, "utf8")
    );
    const primaryVersion = marketplaceJson.metadata.version;
    
    console.log(`Primary version (marketplace.json): ${primaryVersion}\n`);
    
    let isConsistent = true;
    const versionChecks = [];
    
    // Check CHANGELOG.md
    try {
      const changelogPath = path.join(repoRoot, "CHANGELOG.md");
      const changelogContent = await fs.readFile(changelogPath, "utf8");
      const changelogVersionMatch = changelogContent.match(/^## (\d+\.\d+\.\d+)/m);
      if (changelogVersionMatch) {
        const changelogVersion = changelogVersionMatch[1];
        const match = changelogVersion === primaryVersion;
        versionChecks.push({
          file: "CHANGELOG.md",
          version: changelogVersion,
          match
        });
        if (!match) isConsistent = false;
      }
    } catch (err) {
      // File might not exist
    }
    
    // Check CHANGELOG.zh.md
    try {
      const changelogZhPath = path.join(repoRoot, "CHANGELOG.zh.md");
      const changelogZhContent = await fs.readFile(changelogZhPath, "utf8");
      const changelogZhVersionMatch = changelogZhContent.match(/^## (\d+\.\d+\.\d+)/m);
      if (changelogZhVersionMatch) {
        const changelogZhVersion = changelogZhVersionMatch[1];
        const match = changelogZhVersion === primaryVersion;
        versionChecks.push({
          file: "CHANGELOG.zh.md",
          version: changelogZhVersion,
          match
        });
        if (!match) isConsistent = false;
      }
    } catch (err) {
      // File might not exist
    }
    
    // Check package.json if exists
    try {
      const packageJsonPath = path.join(repoRoot, "package.json");
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, "utf8")
      );
      if (packageJson.version) {
        const match = packageJson.version === primaryVersion;
        versionChecks.push({
          file: "package.json",
          version: packageJson.version,
          match
        });
        if (!match) isConsistent = false;
      }
    } catch (err) {
      // File might not exist or invalid JSON
    }
    
    // Print results
    console.log("Version Consistency Check:");
    console.log("─".repeat(50));
    
    versionChecks.forEach(({ file, version, match }) => {
      const status = match ? "✓" : "✗";
      console.log(`${status} ${file.padEnd(20)} v${version}`);
    });
    
    console.log("─".repeat(50));
    
    if (isConsistent) {
      console.log("\n✓ All versions are consistent!\n");
      process.exit(0);
    } else {
      console.error("\n✗ Version mismatch detected!\n");
      console.error("To fix: Run /release-skills to synchronize versions\n");
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
