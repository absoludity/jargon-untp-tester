#!/usr/bin/env node

const path = require("path");
const chalk = require("chalk");

// Import our modules
const { downloadFile } = require("./lib/downloader");
const { validateJsonSchema } = require("./lib/json-schema-validator");
const {
  createLocalContextSample,
  runJsonLdExpand,
} = require("./lib/jsonld-processor");
const {
  ensureDirectoryExists,
  createArtefactPaths,
} = require("./lib/file-utils");

async function downloadUntpVersion(version) {
  console.log(
    chalk.blue.bold(`\n🧪 Testing UNTP files for version ${version}...\n`),
  );

  // Create directory structure
  const { versionDir, contextPath, schemaPath, samplePath, expandedPath } =
    createArtefactPaths(version, "dpp");

  try {
    await ensureDirectoryExists(versionDir);
  } catch (error) {
    console.log(
      chalk.red(`✗ Failed to create directory ${versionDir}: ${error.message}`),
    );
    process.exit(1);
  }

  // Base URL for DPP artefacts
  const dppArtefactsBaseUrl = `https://jargon.sh/user/unece/DigitalProductPassport/v/${version}/artefacts`;

  const downloads = [
    {
      name: "DigitalProductPassport context",
      url: `${dppArtefactsBaseUrl}/jsonldContexts/DigitalProductPassport.jsonld?class=DigitalProductPassport`,
      output: contextPath,
    },
    {
      name: "DigitalProductPassport schema",
      url: `${dppArtefactsBaseUrl}/jsonSchemas/DigitalProductPassport.json?class=DigitalProductPassport`,
      output: schemaPath,
    },
    {
      name: "DigitalProductPassport sample",
      url: `${dppArtefactsBaseUrl}/jsonSchemas/DigitalProductPassport_instance.json?class=DigitalProductPassport_instance`,
      output: samplePath,
    },
  ];

  // Download all files
  for (const download of downloads) {
    try {
      const result = await downloadFile(download.url, download.output);
      download.wasDownloaded = result.wasDownloaded;
    } catch (error) {
      process.exit(1);
    }
  }

  // Validate original sample against schema
  try {
    await validateJsonSchema(samplePath, schemaPath);
  } catch (error) {
    // Continue even if schema validation fails
  }

  // Create local context version for JSON-LD testing
  const localContextSamplePath = await createLocalContextSample(
    samplePath,
    version,
  );
  if (!localContextSamplePath) {
    process.exit(1);
  }

  // Expand the local context sample JSON-LD (always run - this is the test!)
  try {
    await runJsonLdExpand(localContextSamplePath, expandedPath);
  } catch (error) {
    process.exit(1);
  }

  console.log(
    chalk.green.bold(
      `\n✅ Done! Files ready in ${chalk.cyan(versionDir + "/")}`,
    ),
  );
  console.log(chalk.gray(`\nFiles created:`));
  console.log(
    chalk.gray(`├── ${chalk.cyan("dpp.context.jsonld")} - JSON-LD context`),
  );
  console.log(chalk.gray(`├── ${chalk.cyan("dpp.schema.json")} - JSON Schema`));
  console.log(
    chalk.gray(
      `├── ${chalk.cyan("dpp.sample.json")} - Original sample instance`,
    ),
  );
  console.log(
    chalk.gray(
      `├── ${chalk.cyan("dpp.sample.local-context.json")} - Sample with local context`,
    ),
  );
  console.log(
    chalk.gray(
      `└── ${chalk.cyan("dpp.sample.expanded.json")} - Expanded JSON-LD`,
    ),
  );
}

function showUsage() {
  console.log(
    chalk.yellow("Usage:"),
    "node test-untp-version.js",
    chalk.green("<version>"),
  );
  console.log(
    chalk.yellow("Example:"),
    "node test-untp-version.js",
    chalk.green("0.6.1"),
  );
  console.log();
  console.log(
    chalk.yellow("Or via npm:"),
    "npm run test-version --",
    chalk.green("<version>"),
  );
}

// Main execution
if (process.argv.length < 3) {
  showUsage();
  process.exit(1);
}

const version = process.argv[2];

downloadUntpVersion(version).catch((error) => {
  console.log(chalk.red(`\n❌ Error: ${error.message}`));
  process.exit(1);
});
