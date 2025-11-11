const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");
const ora = require("ora");

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

module.exports = {
  downloadFile,
};
