/**
 * Configuration for UNTP artefact types
 * Maps each UNTP credential type to its URL patterns and file naming conventions
 */

const UNTP_ARTEFACT_CONFIGS = {
  dpp: {
    name: "Digital Product Passport",
    baseUrl: (version) => `https://jargon.sh/user/unece/DigitalProductPassport/v/${version}/artefacts`,
    artefacts: {
      context: {
        urlPath: "jsonldContexts/DigitalProductPassport.jsonld?class=DigitalProductPassport",
        filename: "dpp.context.jsonld"
      },
      schema: {
        urlPath: "jsonSchemas/DigitalProductPassport.json?class=DigitalProductPassport",
        filename: "dpp.schema.json"
      },
      sample: {
        urlPath: "jsonSchemas/DigitalProductPassport_instance.json?class=DigitalProductPassport_instance",
        filename: "dpp.sample.json"
      }
    },
    contextPattern: (version) => `https://test.uncefact.org/vocabulary/untp/dpp/${version}/`,
    localContextFile: "./dpp.context.jsonld"
  },

  dcc: {
    name: "Digital Conformity Credential",
    baseUrl: (version) => `https://jargon.sh/user/unece/ConformityCredential/v/${version}/artefacts`,
    artefacts: {
      context: {
        urlPath: "jsonldContexts/ConformityCredential.jsonld?class=ConformityCredential",
        filename: "dcc.context.jsonld"
      },
      schema: {
        urlPath: "jsonSchemas/DigitalConformityCredential.json?class=DigitalConformityCredential",
        filename: "dcc.schema.json"
      },
      sample: {
        urlPath: "jsonSchemas/DigitalConformityCredential_instance.json?class=DigitalConformityCredential_instance",
        filename: "dcc.sample.json"
      }
    },
    contextPattern: (version) => `https://test.uncefact.org/vocabulary/untp/dcc/${version}/`,
    localContextFile: "./dcc.context.jsonld"
  }
};

/**
 * Get configuration for a specific UNTP type
 */
function getArtefactConfig(type) {
  const config = UNTP_ARTEFACT_CONFIGS[type];
  if (!config) {
    throw new Error(`Unknown UNTP artefact type: ${type}. Available types: ${Object.keys(UNTP_ARTEFACT_CONFIGS).join(', ')}`);
  }
  return config;
}

/**
 * Get all available UNTP types
 */
function getAvailableTypes() {
  return Object.keys(UNTP_ARTEFACT_CONFIGS);
}

/**
 * Generate download configuration for a specific type and version
 */
function generateDownloadConfig(type, version) {
  const config = getArtefactConfig(type);
  const baseUrl = config.baseUrl(version);

  return {
    type,
    version,
    name: config.name,
    downloads: [
      {
        name: `${config.name} context`,
        url: `${baseUrl}/${config.artefacts.context.urlPath}`,
        filename: config.artefacts.context.filename
      },
      {
        name: `${config.name} schema`,
        url: `${baseUrl}/${config.artefacts.schema.urlPath}`,
        filename: config.artefacts.schema.filename
      },
      {
        name: `${config.name} sample`,
        url: `${baseUrl}/${config.artefacts.sample.urlPath}`,
        filename: config.artefacts.sample.filename
      }
    ],
    contextPattern: config.contextPattern(version),
    localContextFile: config.localContextFile
  };
}

module.exports = {
  getArtefactConfig,
  getAvailableTypes,
  generateDownloadConfig,
  UNTP_ARTEFACT_CONFIGS
};
