const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");
const ora = require("ora");
const jsonld = require("jsonld");

async function createLocalContextSample(
  samplePath,
  contextPattern,
  localContextFile,
) {
  const spinner = ora("Creating sample with local context...").start();

  try {
    const content = await fs.readFile(samplePath, "utf8");
    const jsonData = JSON.parse(content);

    // Find and update the UNTP context URL in the @context array
    if (jsonData["@context"] && Array.isArray(jsonData["@context"])) {
      const contextArray = jsonData["@context"];

      for (let i = 0; i < contextArray.length; i++) {
        if (
          typeof contextArray[i] === "string" &&
          contextArray[i].includes(contextPattern)
        ) {
          contextArray[i] = localContextFile;
          break;
        }
      }

      // Special handling for DLP - also replace DPP context with local reference
      if (localContextFile === "./dlp.context.jsonld") {
        for (let i = 0; i < contextArray.length; i++) {
          if (
            typeof contextArray[i] === "string" &&
            contextArray[i].includes(
              "https://test.uncefact.org/vocabulary/untp/dpp/",
            )
          ) {
            contextArray[i] = "./dpp.context.jsonld";
            break;
          }
        }
      }
    }

    // Write to new file with local context suffix
    const localContextPath = samplePath.replace(".json", ".local-context.json");
    await fs.writeFile(
      localContextPath,
      JSON.stringify(jsonData, null, 2) + "\n",
    );

    spinner.succeed(
      `Created ${chalk.cyan(path.basename(localContextPath))} with local context`,
    );
    return localContextPath;
  } catch (error) {
    spinner.fail(`Error creating local context sample: ${error.message}`);
    return null;
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
      // Safe mode failed - show error details and try to create expanded file anyway
      spinner.fail(`JSON-LD validation failed: ${error.message}`);

      // Show error details if available
      if (error.details) {
        console.log(chalk.red("\n🚨 Error Details:"));
        console.log(chalk.gray(JSON.stringify(error.details, null, 2)));
      }

      // Try to create expanded file anyway for analysis (in non-safe mode)
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

      try {
        const expanded = await jsonld.expand(doc, warningOptions);
        await fs.writeFile(
          outputPath,
          JSON.stringify(expanded, null, 2) + "\n",
        );
        console.log(
          chalk.gray(`\nCreated ${path.basename(outputPath)} for analysis`),
        );

        // Show any additional validation issues found
        if (validationIssues.length > 0) {
          console.log(
            chalk.yellow(
              `\n📋 Additional validation warnings found (${validationIssues.length}):`,
            ),
          );
          validationIssues.forEach((issue, index) => {
            console.log(
              chalk.yellow(`\n${index + 1}. ${issue.code}: ${issue.message}`),
            );
            if (issue.details) {
              console.log(chalk.gray(JSON.stringify(issue.details, null, 2)));
            }
          });
        }
      } catch (secondError) {
        console.log(
          chalk.red(`\nCould not create expanded file: ${secondError.message}`),
        );
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

async function createSimpleTestCredential(
  type,
  version,
  localContextFile,
  outputPath,
) {
  const spinner = ora("Creating simple test credential...").start();

  try {
    // Create a simple test credential with minimal required structure
    const testCredential = {
      type: ["VerifiableCredential"],
      "@context": ["https://www.w3.org/ns/credentials/v2", localContextFile],
      id: `https://example.com/credentials/test-${type}-${Date.now()}`,
      issuer: {
        type: ["CredentialIssuer"],
        id: "did:web:example.com",
        name: "Test Issuer",
      },
      validFrom: new Date().toISOString(),
      credentialSubject: {
        type: ["Product"],
        id: `https://example.com/subjects/test-${type}`,
        name: `Test product for ${type} context validation`,
        registeredId: "TEST-123",
        idScheme: {
          type: ["IdentifierScheme"],
          id: "https://example.com/schemes/test",
          name: "Test ID Scheme",
        },
        description: `Simple test product to validate ${type} context`,
      },
    };

    // Write to file
    await fs.writeFile(
      outputPath,
      JSON.stringify(testCredential, null, 2) + "\n",
    );

    spinner.succeed(
      `Created ${chalk.cyan(path.basename(outputPath))} test credential`,
    );
    return outputPath;
  } catch (error) {
    spinner.fail(`Error creating simple test credential: ${error.message}`);
    return null;
  }
}

module.exports = {
  createLocalContextSample,
  createSimpleTestCredential,
  runJsonLdExpand,
};
