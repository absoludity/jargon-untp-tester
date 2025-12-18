#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");
const { getAvailableTypes } = require("./lib/artefact-config");

// Generate file mappings based on consistent patterns
function generateFileMappings(type) {
  const targetDir = `untp-${type}`;
  const mappings = {
    [`${type}.vocabulary.jsonld`]: "vocabulary.jsonld",
    [`${type}.context.jsonld`]: "artefacts/context.jsonld",
  };

  // Core type only has vocabulary and context
  if (type !== "core") {
    mappings[`${type}.schema.json`] = `artefacts/untp-${type}-schema.json`;
    mappings[`${type}.sample.json`] = `artefacts/untp-${type}-instance.json`;
  }

  return {
    targetDir,
    files: mappings,
  };
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
  }
}

async function copyFile(sourcePath, destPath) {
  try {
    const content = await fs.readFile(sourcePath);
    await fs.writeFile(destPath, content);
    return true;
  } catch (error) {
    console.log(
      chalk.red(
        `✗ Failed to copy ${path.basename(sourcePath)}: ${error.message}`,
      ),
    );
    return false;
  }
}

async function copyType(type, version, dataModelsDir) {
  console.log(chalk.yellow(`\n--- Copying ${type.toUpperCase()} ---`));

  const mapping = generateFileMappings(type);
  const sourceVersionDir = path.join("downloads", version);
  const targetTypeDir = path.join(dataModelsDir, mapping.targetDir);

  // Check if source version directory exists
  if (!(await fileExists(sourceVersionDir))) {
    console.log(chalk.red(`✗ Source directory not found: ${sourceVersionDir}`));
    console.log(
      chalk.gray(`   Run: npm run test-version -- ${version} --types ${type}`),
    );
    return false;
  }

  let copiedCount = 0;
  let totalCount = Object.keys(mapping.files).length;

  for (const [sourceFile, targetFile] of Object.entries(mapping.files)) {
    const sourcePath = path.join(sourceVersionDir, sourceFile);
    const targetPath = path.join(targetTypeDir, targetFile);

    // Check if source file exists
    if (!(await fileExists(sourcePath))) {
      console.log(chalk.yellow(`⚠ Source file not found: ${sourceFile}`));
      continue;
    }

    // Ensure target directory exists
    const targetDir = path.dirname(targetPath);
    await ensureDirectoryExists(targetDir);

    // Copy file
    const success = await copyFile(sourcePath, targetPath);
    if (success) {
      console.log(
        chalk.green(`✓ ${sourceFile} → ${mapping.targetDir}/${targetFile}`),
      );
      copiedCount++;
    }
  }

  console.log(
    chalk.green(
      `✓ Copied ${copiedCount}/${totalCount} files for ${type.toUpperCase()}`,
    ),
  );
  return copiedCount > 0;
}

async function copyToDataModels(version, types, dataModelsDir) {
  console.log(
    chalk.blue.bold(
      `\n🚀 Copying UNTP files from version ${version} to data-models...\n`,
    ),
  );

  // Validate data-models directory exists
  if (!(await fileExists(dataModelsDir))) {
    console.log(
      chalk.red(`✗ Data models directory not found: ${dataModelsDir}`),
    );
    console.log(
      chalk.gray(`   Please provide a valid path to the data-models directory`),
    );
    process.exit(1);
  }

  let successCount = 0;

  for (const type of types) {
    const success = await copyType(type, version, dataModelsDir);
    if (success) successCount++;
  }

  console.log(
    chalk.green.bold(
      `\n✅ Copy complete! ${successCount}/${types.length} types copied successfully`,
    ),
  );

  if (successCount < types.length) {
    console.log(
      chalk.yellow(
        "\n⚠️  Some copies failed. Check the output above for details.",
      ),
    );
  }
}

function showUsage() {
  console.log(chalk.yellow("Usage:"));
  console.log(
    "  node copy-to-data-models.js",
    chalk.green("<data-models-dir>"),
    chalk.green("<version>"),
    chalk.blue("[options]"),
  );
  console.log();
  console.log(chalk.yellow("Options:"));
  console.log(
    "  --types",
    chalk.green("<type1,type2>"),
    "  UNTP types to copy (default: all available)",
  );
  console.log("  --help                    Show this help message");
  console.log();
  console.log(chalk.yellow("Available types:"), getAvailableTypes().join(", "));
  console.log();
  console.log(chalk.yellow("Examples:"));
  console.log(
    "  node copy-to-data-models.js",
    chalk.green("../data-models 0.6.1"),
  );
  console.log(
    "  node copy-to-data-models.js",
    chalk.green("../data-models 0.6.1"),
    chalk.blue("--types dpp,dcc"),
  );
  console.log(
    "  node copy-to-data-models.js",
    chalk.green("./data-models working"),
    chalk.blue("--types core"),
  );
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    showUsage();
    process.exit(args.includes("--help") ? 0 : 1);
  }

  if (args.length < 2) {
    console.log(chalk.red("\n❌ Missing required arguments"));
    showUsage();
    process.exit(1);
  }

  const dataModelsDir = args[0];
  const version = args[1];
  let types = getAvailableTypes(); // default to all types

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

  return { dataModelsDir, version, types };
}

// Main execution
const { dataModelsDir, version, types } = parseArgs();

copyToDataModels(version, types, dataModelsDir).catch((error) => {
  console.log(chalk.red(`\n❌ Error: ${error.message}`));
  process.exit(1);
});
