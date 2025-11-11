const fs = require("fs").promises;
const chalk = require("chalk");
const ora = require("ora");
const Ajv = require("ajv/dist/2020");
const addFormats = require("ajv-formats");

async function validateJsonSchema(samplePath, schemaPath) {
  const spinner = ora("Validating JSON Schema...").start();

  try {
    // Read schema and sample files
    const schemaContent = await fs.readFile(schemaPath, "utf8");
    const sampleContent = await fs.readFile(samplePath, "utf8");

    const schema = JSON.parse(schemaContent);
    const sample = JSON.parse(sampleContent);

    // Create AJV instance with 2020-12 support (matching UNTP test suite)
    const ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
      schemaId: "$id",
      validateSchema: false, // Disable to prevent meta-schema validation issues
    });

    // Add format support
    addFormats(ajv);

    // Compile schema
    const validate = ajv.compile(schema);

    // Validate sample
    const valid = validate(sample);

    if (valid) {
      spinner.succeed(`JSON Schema validation passed`);
    } else {
      spinner.fail(`JSON Schema validation failed`);
      console.log(
        chalk.red(`\n📋 Found ${validate.errors.length} schema error(s):`),
      );
      validate.errors.forEach((error, index) => {
        console.log(
          chalk.red(
            `\n${index + 1}. ${error.instancePath || "root"}: ${error.message}`,
          ),
        );
        if (error.data !== undefined) {
          console.log(chalk.gray(`   Value: ${JSON.stringify(error.data)}`));
        }
        if (error.schemaPath) {
          console.log(chalk.gray(`   Schema path: ${error.schemaPath}`));
        }
      });
      throw new Error("JSON Schema validation failed");
    }
  } catch (error) {
    if (!error.message.includes("JSON Schema validation failed")) {
      spinner.fail(`JSON Schema validation error: ${error.message}`);
    }
    throw error;
  }
}

module.exports = {
  validateJsonSchema,
};
