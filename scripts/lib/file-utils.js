const fs = require("fs").promises;
const path = require("path");

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

function getVersionDirectory(version) {
  return path.join("downloads", version);
}

function getArtefactPath(versionDir, filename) {
  return path.join(versionDir, filename);
}

function createArtefactPaths(version, type) {
  const versionDir = getVersionDirectory(version);
  return {
    versionDir,
    contextPath: getArtefactPath(versionDir, `${type}.context.jsonld`),
    vocabularyPath: getArtefactPath(versionDir, `${type}.vocabulary.jsonld`),
    schemaPath: getArtefactPath(versionDir, `${type}.schema.json`),
    samplePath: getArtefactPath(versionDir, `${type}.sample.json`),
    expandedPath: getArtefactPath(versionDir, `${type}.sample.expanded.json`),
    localContextSamplePath: getArtefactPath(
      versionDir,
      `${type}.sample.local-context.json`,
    ),
  };
}

module.exports = {
  ensureDirectoryExists,
  fileExists,
  getVersionDirectory,
  getArtefactPath,
  createArtefactPaths,
};
