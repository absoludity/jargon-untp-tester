#!/usr/bin/env node

const path = require("path");
const chalk = require("chalk");

// Import our modules
const { downloadFile } = require("./lib/downloader");
const { validateJsonSchema } = require("./lib/json-schema-validator");
const {
  createLocalContextSample,
  createSimpleTestCredential,
  runJsonLdExpand,
} = require("./lib/jsonld-processor");
const {
  ensureDirectoryExists,
  createArtefactPaths,
} = require("./lib/file-utils");
const {
  getAvailableTypes,
  generateDownloadConfig,
} = require("./lib/artefact-config");

async function downloadUntpVersion(version, types = ["dpp"]) {
  console.log(
    chalk.blue.bold(
      `\n🧪 Testing UNTP files for version ${version} (types: ${types.join(", ")})...\n`,
    ),
  );

  for (const type of types) {
    await processUntpType(version, type);
  }
}

async function processUntpType(version, type) {
  console.log(chalk.yellow(`\n--- Processing ${type.toUpperCase()} ---`));

  // Get configuration for this type
  const config = generateDownloadConfig(type, version);

  // Create directory structure and paths
  const {
    versionDir,
    contextPath,
    schemaPath,
    samplePath,
    expandedPath,
    localContextSamplePath,
  } = createArtefactPaths(version, type);

  try {
    await ensureDirectoryExists(versionDir);
  } catch (error) {
    console.log(
      chalk.red(`✗ Failed to create directory ${versionDir}: ${error.message}`),
    );
    process.exit(1);
  }

  // Download all files for this type
  for (const download of config.downloads) {
    try {
      const outputPath = path.join(versionDir, download.filename);
      const result = await downloadFile(download.url, outputPath);
      download.wasDownloaded = result.wasDownloaded;
    } catch (error) {
      process.exit(1);
    }
  }

  // Check what files are available for this type
  const hasSchema = config.downloads.some((d) =>
    d.filename.includes(".schema.json"),
  );
  const hasSample = config.downloads.some((d) =>
    d.filename.includes(".sample.json"),
  );

  if (hasSchema && hasSample) {
    // Full validation path: validate original sample against schema
    try {
      await validateJsonSchema(samplePath, schemaPath);
    } catch (error) {
      // Continue even if schema validation fails
    }

    // Create local context version for JSON-LD testing
    const localContextSampleResult = await createLocalContextSample(
      samplePath,
      config.contextPattern,
      config.localContextFile,
    );
    if (!localContextSampleResult) {
      process.exit(1);
    }

    // Expand the local context sample JSON-LD (always run - this is the test!)
    try {
      await runJsonLdExpand(localContextSampleResult, expandedPath);
    } catch (error) {
      process.exit(1);
    }
  } else {
    // Context-only path: create simple test credential and run JSON-LD expansion
    console.log(
      chalk.gray(
        `  Note: ${config.name} only has context file, creating test credential for JSON-LD validation`,
      ),
    );

    // Create a simple test credential for this context
    const testCredentialPath = path.join(
      versionDir,
      `${type}.test-credential.json`,
    );
    const testCredentialResult = await createSimpleTestCredential(
      type,
      version,
      config.localContextFile,
      testCredentialPath,
    );
    if (!testCredentialResult) {
      process.exit(1);
    }

    // Expand the test credential JSON-LD (this validates the context works)
    try {
      await runJsonLdExpand(testCredentialResult, expandedPath);
    } catch (error) {
      process.exit(1);
    }
  }

  // Show completion for this type
  console.log(chalk.green(`✓ Completed processing ${type.toUpperCase()}`));
}

function showSummary(version, types) {
  const versionDir = path.join("downloads", version);
  console.log(
    chalk.green.bold(
      `\n✅ Done! Files ready in ${chalk.cyan(versionDir + "/")}`,
    ),
  );
  console.log(chalk.gray(`\nFiles created for types: ${types.join(", ")}`));

  for (const type of types) {
    const config = generateDownloadConfig(type, "0.0.0"); // dummy version for config check
    const hasSchema = config.downloads.some((d) =>
      d.filename.includes(".schema.json"),
    );
    const hasSample = config.downloads.some((d) =>
      d.filename.includes(".sample.json"),
    );

    console.log(chalk.gray(`\n${type.toUpperCase()} files:`));
    console.log(
      chalk.gray(
        `├── ${chalk.cyan(`${type}.context.jsonld`)} - JSON-LD context`,
      ),
    );
    console.log(
      chalk.gray(
        `├── ${chalk.cyan(`${type}.vocabulary.jsonld`)} - RDF vocabulary`,
      ),
    );

    if (hasSchema) {
      console.log(
        chalk.gray(`├── ${chalk.cyan(`${type}.schema.json`)} - JSON Schema`),
      );
    }

    if (hasSample) {
      console.log(
        chalk.gray(
          `├── ${chalk.cyan(`${type}.sample.json`)} - Original sample instance`,
        ),
      );
      console.log(
        chalk.gray(
          `├── ${chalk.cyan(`${type}.sample.local-context.json`)} - Sample with local context`,
        ),
      );
      console.log(
        chalk.gray(
          `└── ${chalk.cyan(`${type}.sample.expanded.json`)} - Expanded JSON-LD`,
        ),
      );
    } else if (!hasSchema) {
      // Context and vocabulary only - show test credential files
      console.log(
        chalk.gray(
          `├── ${chalk.cyan(`${type}.test-credential.json`)} - Generated test credential`,
        ),
      );
      console.log(
        chalk.gray(
          `└── ${chalk.cyan(`${type}.sample.expanded.json`)} - Expanded JSON-LD`,
        ),
      );
    }
  }
}

function showUsage() {
  console.log(chalk.yellow("Usage:"));
  console.log(
    "  node test-untp-version.js",
    chalk.green("<version>"),
    chalk.blue("[options]"),
  );
  console.log();
  console.log(chalk.yellow("Options:"));
  console.log(
    "  --types",
    chalk.green("<type1,type2>"),
    "  UNTP types to process (default: dpp)",
  );
  console.log("  --help                    Show this help message");
  console.log();
  console.log(chalk.yellow("Available types:"), getAvailableTypes().join(", "));
  console.log();
  console.log(chalk.yellow("Examples:"));
  console.log("  node test-untp-version.js", chalk.green("0.6.1"));
  console.log(
    "  node test-untp-version.js",
    chalk.green("0.6.1"),
    chalk.blue("--types dpp"),
  );
  console.log(
    "  node test-untp-version.js",
    chalk.green("0.6.1"),
    chalk.blue("--types dpp,dcc"),
  );
  console.log();
  console.log(chalk.yellow("Or via npm:"));
  console.log("  npm run test-version --", chalk.green("0.6.1"));
  console.log(
    "  npm run test-version --",
    chalk.green("0.6.1"),
    chalk.blue("--types dcc"),
  );
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    showUsage();
    process.exit(args.includes("--help") ? 0 : 1);
  }

  const version = args[0];
  let types = ["dpp"]; // default

  const typesIndex = args.indexOf("--types");
  if (typesIndex !== -1 && args[typesIndex + 1]) {
    types = args[typesIndex + 1].split(",").map((t) => t.trim());

    // Validate types
    const availableTypes = getAvailableTypes();
    for (const type of types) {
      if (!availableTypes.includes(type)) {
        console.log(chalk.red(`\n❌ Unknown type: ${type}`));
        console.log(
          chalk.gray(`Available types: ${availableTypes.join(", ")}`),
        );
        process.exit(1);
      }
    }
  }

  return { version, types };
}

// Main execution
const { version, types } = parseArgs();

downloadUntpVersion(version, types)
  .then(() => showSummary(version, types))
  .catch((error) => {
    console.log(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  });
