/**
 * Configuration for UNTP artefact types
 * Maps each UNTP credential type to its URL patterns and file naming conventions
 */

const UNTP_ARTEFACT_CONFIGS = {
  dpp: {
    name: "Digital Product Passport",
    baseUrl: (version) =>
      `https://jargon.sh/user/unece/DigitalProductPassport/v/${version}/artefacts`,
    artefacts: {
      context: {
        urlPath:
          "jsonldContexts/DigitalProductPassport.jsonld?class=DigitalProductPassport",
        filename: "dpp.context.jsonld",
      },
      vocabulary: {
        urlPath: "jsonld/render.jsonld",
        filename: "dpp.vocabulary.jsonld",
      },
      schema: {
        urlPath:
          "jsonSchemas/DigitalProductPassport.json?class=DigitalProductPassport",
        filename: "dpp.schema.json",
      },
      sample: {
        urlPath:
          "jsonSchemas/DigitalProductPassport_instance.json?class=DigitalProductPassport_instance",
        filename: "dpp.sample.json",
      },
    },
    contextPattern: (version) =>
      `https://test.uncefact.org/vocabulary/untp/dpp/${version}/`,
    localContextFile: "./dpp.context.jsonld",
  },

  dcc: {
    name: "Digital Conformity Credential",
    baseUrl: (version) =>
      `https://jargon.sh/user/unece/ConformityCredential/v/${version}/artefacts`,
    artefacts: {
      context: {
        urlPath:
          "jsonldContexts/ConformityCredential.jsonld?class=ConformityCredential",
        filename: "dcc.context.jsonld",
      },
      vocabulary: {
        urlPath: "jsonld/render.jsonld",
        filename: "dcc.vocabulary.jsonld",
      },
      schema: {
        urlPath:
          "jsonSchemas/DigitalConformityCredential.json?class=DigitalConformityCredential",
        filename: "dcc.schema.json",
      },
      sample: {
        urlPath:
          "jsonSchemas/DigitalConformityCredential_instance.json?class=DigitalConformityCredential_instance",
        filename: "dcc.sample.json",
      },
    },
    contextPattern: (version) =>
      `https://test.uncefact.org/vocabulary/untp/dcc/${version}/`,
    localContextFile: "./dcc.context.jsonld",
  },

  dfr: {
    name: "Digital Facility Record",
    baseUrl: (version) =>
      `https://jargon.sh/user/unece/DigitalFacilityRecord/v/${version}/artefacts`,
    artefacts: {
      context: {
        urlPath:
          "jsonldContexts/DigitalFacilityRecord.jsonld?class=DigitalFacilityRecord",
        filename: "dfr.context.jsonld",
      },
      vocabulary: {
        urlPath: "jsonld/render.jsonld",
        filename: "dfr.vocabulary.jsonld",
      },
      schema: {
        urlPath:
          "jsonSchemas/DigitalFacilityRecord.json?class=DigitalFacilityRecord",
        filename: "dfr.schema.json",
      },
      sample: {
        urlPath:
          "jsonSchemas/DigitalFacilityRecord_instance.json?class=DigitalFacilityRecord_instance",
        filename: "dfr.sample.json",
      },
    },
    contextPattern: (version) =>
      `https://test.uncefact.org/vocabulary/untp/dfr/${version}/`,
    localContextFile: "./dfr.context.jsonld",
  },

  dia: {
    name: "Digital Identity Anchor",
    baseUrl: (version) =>
      `https://jargon.sh/user/unece/DigitalIdentityAnchor/v/${version}/artefacts`,
    artefacts: {
      context: {
        urlPath:
          "jsonldContexts/DigitalIdentityAnchor.jsonld?class=DigitalIdentityAnchor",
        filename: "dia.context.jsonld",
      },
      vocabulary: {
        urlPath: "jsonld/render.jsonld",
        filename: "dia.vocabulary.jsonld",
      },
      schema: {
        urlPath:
          "jsonSchemas/DigitalIdentityAnchor.json?class=DigitalIdentityAnchor",
        filename: "dia.schema.json",
      },
      sample: {
        urlPath:
          "jsonSchemas/DigitalIdentityAnchor_instance.json?class=DigitalIdentityAnchor_instance",
        filename: "dia.sample.json",
      },
    },
    contextPattern: (version) =>
      `https://test.uncefact.org/vocabulary/untp/dia/${version}/`,
    localContextFile: "./dia.context.jsonld",
  },

  dte: {
    name: "Digital Traceability Event",
    baseUrl: (version) =>
      `https://jargon.sh/user/unece/traceabilityEvents/v/${version}/artefacts`,
    artefacts: {
      context: {
        urlPath:
          "jsonldContexts/traceabilityEvents.jsonld?class=traceabilityEvents",
        filename: "dte.context.jsonld",
      },
      vocabulary: {
        urlPath: "jsonld/render.jsonld",
        filename: "dte.vocabulary.jsonld",
      },
      schema: {
        urlPath:
          "jsonSchemas/DigitalTraceabilityEvent.json?class=DigitalTraceabilityEvent",
        filename: "dte.schema.json",
      },
      sample: {
        urlPath:
          "jsonSchemas/DigitalTraceabilityEvent_instance.json?class=DigitalTraceabilityEvent_instance",
        filename: "dte.sample.json",
      },
    },
    contextPattern: (version) =>
      `https://test.uncefact.org/vocabulary/untp/dte/${version}/`,
    localContextFile: "./dte.context.jsonld",
  },

  core: {
    name: "UNTP Core",
    baseUrl: (version) =>
      `https://jargon.sh/user/unece/untp-core/v/${version}/artefacts`,
    artefacts: {
      context: {
        urlPath: "jsonldContexts/untp-core.jsonld?class=untp-core",
        filename: "core.context.jsonld",
      },
      vocabulary: {
        urlPath: "jsonld/render.jsonld",
        filename: "core.vocabulary.jsonld",
      },
      // Note: core only has context and vocabulary, no schema or sample
    },
    contextPattern: (version) =>
      `https://test.uncefact.org/vocabulary/untp/core/${version}/`,
    localContextFile: "./core.context.jsonld",
  },

  dlp: {
    name: "Digital Livestock Product",
    baseUrl: (version) =>
      `https://jargon.sh/user/aatp/DigitalLivestockPassport/v/${version}/artefacts`,
    artefacts: {
      context: {
        urlPath:
          "jsonldContexts/DigitalLivestockPassport.jsonld?class=DigitalLivestockPassport",
        filename: "dlp.context.jsonld",
      },
      vocabulary: {
        urlPath: "jsonld/render.jsonld",
        filename: "dlp.vocabulary.jsonld",
      },
      schema: {
        urlPath:
          "jsonSchemas/DigitalLivestockPassport.json?class=DigitalLivestockPassport",
        filename: "dlp.schema.json",
      },
      sample: {
        urlPath:
          "jsonSchemas/DigitalLivestockPassport_instance.json?class=DigitalLivestockPassport_instance",
        filename: "dlp.sample.json",
      },
    },
    contextPattern: (version) =>
      `https://aatp.foodagility.com/context/aatp-dlp-context-${version}.jsonld`,
    localContextFile: "./dlp.context.jsonld",
  },
};

/**
 * Get configuration for a specific UNTP type
 */
function getArtefactConfig(type) {
  const config = UNTP_ARTEFACT_CONFIGS[type];
  if (!config) {
    throw new Error(
      `Unknown UNTP artefact type: ${type}. Available types: ${Object.keys(UNTP_ARTEFACT_CONFIGS).join(", ")}`,
    );
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

  const downloads = [];

  // Add context if it exists
  if (config.artefacts.context) {
    downloads.push({
      name: `${config.name} context`,
      url: `${baseUrl}/${config.artefacts.context.urlPath}`,
      filename: config.artefacts.context.filename,
    });
  }

  // Add schema if it exists
  if (config.artefacts.schema) {
    downloads.push({
      name: `${config.name} schema`,
      url: `${baseUrl}/${config.artefacts.schema.urlPath}`,
      filename: config.artefacts.schema.filename,
    });
  }

  // Add vocabulary if it exists
  if (config.artefacts.vocabulary) {
    downloads.push({
      name: `${config.name} vocabulary`,
      url: `${baseUrl}/${config.artefacts.vocabulary.urlPath}`,
      filename: config.artefacts.vocabulary.filename,
    });
  }

  // Add sample if it exists
  if (config.artefacts.sample) {
    downloads.push({
      name: `${config.name} sample`,
      url: `${baseUrl}/${config.artefacts.sample.urlPath}`,
      filename: config.artefacts.sample.filename,
    });
  }

  return {
    type,
    version,
    name: config.name,
    downloads,
    contextPattern: config.contextPattern(version),
    localContextFile: config.localContextFile,
  };
}

module.exports = {
  getArtefactConfig,
  getAvailableTypes,
  generateDownloadConfig,
  UNTP_ARTEFACT_CONFIGS,
};
