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

function getArtefactPath(versionDir, artefactName) {
  return path.join(versionDir, artefactName);
}

function createArtefactPaths(version, prefix) {
  const versionDir = getVersionDirectory(version);
  return {
    versionDir,
    contextPath: getArtefactPath(versionDir, `${prefix}.context.jsonld`),
    schemaPath: getArtefactPath(versionDir, `${prefix}.schema.json`),
    samplePath: getArtefactPath(versionDir, `${prefix}.sample.json`),
    expandedPath: getArtefactPath(versionDir, `${prefix}.sample.expanded.json`),
  };
}

module.exports = {
  ensureDirectoryExists,
  fileExists,
  getVersionDirectory,
  getArtefactPath,
  createArtefactPaths,
};
