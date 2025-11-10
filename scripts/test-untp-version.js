#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");
const ora = require("ora");
const jsonld = require("jsonld");

async function downloadFile(url, outputPath) {
  // Check if file already exists
  try {
    await fs.access(outputPath);
    console.log(
      `${chalk.gray("↓")} ${chalk.cyan(path.basename(outputPath))} ${chalk.gray("(already exists)")}`,
    );
    return { wasDownloaded: false, sizeKB: null }; // File exists, no download needed
  } catch (error) {
    // File doesn't exist, proceed with download
  }

  const spinner = ora(`Downloading ${path.basename(outputPath)}...`).start();

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(outputPath, buffer);

    const sizeKB = (buffer.length / 1024).toFixed(1);
    spinner.succeed(
      `Downloaded ${chalk.cyan(path.basename(outputPath))} ${chalk.gray(`(${sizeKB} kB)`)}`,
    );

    return { wasDownloaded: true, sizeKB };
  } catch (error) {
    spinner.fail(
      `Failed to download ${path.basename(outputPath)}: ${error.message}`,
    );
    throw error;
  }
}

async function updateSampleContext(samplePath, version) {
  const spinner = ora("Updating sample file to use local context...").start();

  try {
    const content = await fs.readFile(samplePath, "utf8");
    const jsonData = JSON.parse(content);

    // Find and update the DPP context URL in the @context array
    if (jsonData["@context"] && Array.isArray(jsonData["@context"])) {
      const contextArray = jsonData["@context"];
      const dppUrlPattern = `https://test.uncefact.org/vocabulary/untp/dpp/${version}/`;

      for (let i = 0; i < contextArray.length; i++) {
        if (
          typeof contextArray[i] === "string" &&
          contextArray[i].includes(dppUrlPattern)
        ) {
          contextArray[i] = "./dpp.context.jsonld";
          break;
        }
      }
    }

    // Write back with proper formatting
    await fs.writeFile(samplePath, JSON.stringify(jsonData, null, 2) + "\n");

    spinner.succeed(
      `Updated ${chalk.cyan(path.basename(samplePath))} to use local context`,
    );
    return true;
  } catch (error) {
    spinner.fail(`Error updating sample file: ${error.message}`);
    return false;
  }
}

async function runJsonLdExpand(inputPath, outputPath) {
  const spinner = ora("Expanding JSON-LD sample...").start();

  try {
    // Read the sample file
    const content = await fs.readFile(inputPath, "utf8");
    const doc = JSON.parse(content);

    // Custom document loader to handle local files
    const documentLoader = async (url) => {
      if (url.startsWith("./") || !url.includes("://")) {
        // Handle local file paths
        const filePath = path.resolve(path.dirname(inputPath), url);
        try {
          const content = await fs.readFile(filePath, "utf8");
          return {
            contextUrl: null,
            document: JSON.parse(content),
            documentUrl: url,
          };
        } catch (error) {
          throw new Error(`Failed to load local context file: ${filePath}`);
        }
      }

      // Use default loader for remote URLs
      return jsonld.documentLoaders.node()(url);
    };

    // First try with safe mode enabled (the desired behavior)
    const safeOptions = {
      safe: true,
      documentLoader: documentLoader,
    };

    try {
      // Try expansion with safe mode
      const expanded = await jsonld.expand(doc, safeOptions);

      // Write the expanded output to file
      await fs.writeFile(outputPath, JSON.stringify(expanded, null, 2) + "\n");

      spinner.succeed(`Created ${chalk.cyan(path.basename(outputPath))}`);
    } catch (error) {
      // Safe mode failed - it doesn't collect detailed errors when it fails, so we need
      // to re-run with safe mode false to collect all validation issues for detailed reporting
      const validationIssues = [];
      const warningOptions = {
        safe: false,
        documentLoader: documentLoader,
        eventHandler: (event) => {
          if (event.event && event.event.level === "warning") {
            validationIssues.push(event.event);
          }
        },
      };

      // Run without safe mode to collect all issues and create expanded file
      const expanded = await jsonld.expand(doc, warningOptions);
      await fs.writeFile(outputPath, JSON.stringify(expanded, null, 2) + "\n");

      // Report the validation failure with all collected issues
      spinner.fail(`JSON-LD validation failed in safe mode`);

      if (validationIssues.length > 0) {
        console.log(
          chalk.red(
            `\n📋 Found ${validationIssues.length} validation issue(s):`,
          ),
        );
        validationIssues.forEach((issue, index) => {
          console.log(
            chalk.red(`\n${index + 1}. ${issue.code}: ${issue.message}`),
          );
          if (issue.details) {
            console.log(chalk.gray(JSON.stringify(issue.details, null, 2)));
          }
        });
      }

      throw error;
    }
  } catch (error) {
    if (!error.message.includes("JSON-LD validation failed")) {
      spinner.fail(`JSON-LD expand failed: ${error.message}`);
    }
    throw error;
  }
}

async function downloadUntpVersion(version) {
  console.log(
    chalk.blue.bold(`\n🧪 Testing UNTP files for version ${version}...\n`),
  );

  // Create directory structure
  const downloadsDir = "downloads";
  const versionDir = path.join(downloadsDir, version);
  try {
    await fs.mkdir(versionDir, { recursive: true });
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
      output: path.join(versionDir, "dpp.context.jsonld"),
    },
    {
      name: "DigitalProductPassport schema",
      url: `${dppArtefactsBaseUrl}/jsonSchemas/DigitalProductPassport.json?class=DigitalProductPassport`,
      output: path.join(versionDir, "dpp.schema.json"),
    },
    {
      name: "DigitalProductPassport sample",
      url: `${dppArtefactsBaseUrl}/jsonSchemas/DigitalProductPassport_instance.json?class=DigitalProductPassport_instance`,
      output: path.join(versionDir, "dpp.sample.json"),
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

  // Always run the expansion test (this is the actual validation)
  const samplePath = path.join(versionDir, "dpp.sample.json");
  const expandedPath = path.join(versionDir, "dpp.sample.expanded.json");

  // Only update the sample file context if it was just downloaded
  let sampleExists = false;
  try {
    await fs.access(samplePath);
    sampleExists = true;
  } catch (error) {
    // Sample file doesn't exist, something went wrong
    console.log(chalk.red("✗ Sample file not found after download"));
    process.exit(1);
  }

  // Update the sample file to use local context only if it was downloaded
  if (
    downloads.some(
      (d) => path.basename(d.output) === "dpp.sample.json" && d.wasDownloaded,
    )
  ) {
    const success = await updateSampleContext(samplePath, version);

    if (!success) {
      process.exit(1);
    }
  }

  // Expand the sample JSON-LD (always run - this is the test!)
  try {
    await runJsonLdExpand(samplePath, expandedPath);
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
    chalk.gray(`├── ${chalk.cyan("dpp.sample.json")} - Sample instance`),
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
