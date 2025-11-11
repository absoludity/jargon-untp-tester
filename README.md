# Jargon.sh artefact UNTP Testing Tool

A Node.js tool for downloading and validating UN Transparency Protocol (UNTP) files from the Jargon registry.

## Features

### Current Functionality

- **Multi-type Support**: Downloads and validates multiple UNTP credential types (DPP, DCC)
- **Smart Caching**: Only downloads files that don't already exist locally
- **Comprehensive Validation**:
  - JSON Schema validation using AJV with 2020-12 support
  - JSON-LD expansion validation with detailed error reporting
- **Local Context Testing**: Creates separate sample files with local context references for offline testing
- **Modular Architecture**: Clean separation of concerns for easy extension
- **Configurable**: Easy to add new UNTP credential types via configuration

### Supported UNTP Types

Now supports **all 6 UNTP components**:
1. **CORE** - UNTP Core contexts (foundation vocabularies)
2. **DPP** - Digital Product Passport
3. **DCC** - Digital Conformity Credential
4. **DFR** - Digital Facility Record  
5. **DIA** - Digital Identity Anchor
6. **DTE** - Digital Traceability Event

### Files Downloaded per Type

For each UNTP type and version, the tool downloads:

- `{type}.context.jsonld` - JSON-LD context definitions
- `{type}.schema.json` - JSON Schema for validation
- `{type}.sample.json` - Original sample instance data
- `{type}.sample.local-context.json` - Sample modified to use local context
- `{type}.sample.expanded.json` - Expanded JSON-LD (generated locally)

## Installation

```bash
npm install
```

## Usage

### Via npm script (recommended)
```bash
npm run test-version -- <version> [--types <type1,type2>]
```

### Direct execution
```bash
node scripts/test-untp-version.js <version> [--types <type1,type2>]
```

### Examples
```bash
# Test DPP for stable version (default)
npm run test-version -- 0.6.1

# Test DCC for stable version
npm run test-version -- 0.6.1 --types dcc

# Test multiple types
npm run test-version -- 0.6.1 --types dpp,dcc
npm run test-version -- 0.6.1 --types dfr,dia,dte

# Test with core contexts
npm run test-version -- 0.6.1 --types core,dpp

# Test all UNTP types
npm run test-version -- 0.6.1 --types core,dpp,dcc,dfr,dia,dte

# Test development version
npm run test-version -- working

# Show help
npm run test-version -- --help
```

## Validation Process

For each UNTP type:

1. **Download Files**: Downloads context, schema, and sample files (if not already present)
2. **JSON Schema Validation**: Validates original sample against JSON Schema using AJV 2020-12
3. **Local Context Creation**: Creates copy of sample with local context references
4. **JSON-LD Expansion**: Runs JSON-LD expansion in safe mode for strict validation
5. **Error Reporting**: If validation fails, provides comprehensive error details
6. **Analysis Files**: Creates expanded JSON-LD files for debugging even when validation fails

## Directory Structure

```
downloads/
└── 0.6.1/
    ├── core.context.jsonld
    ├── dpp.context.jsonld
    ├── dpp.schema.json
    ├── dpp.sample.json
    ├── dpp.sample.local-context.json
    ├── dpp.sample.expanded.json
    ├── dcc.context.jsonld
    ├── dcc.schema.json
    ├── dcc.sample.json
    ├── dcc.sample.local-context.json
    ├── dcc.sample.expanded.json
    ├── dfr.context.jsonld
    ├── dfr.schema.json
    ├── dfr.sample.json
    ├── dfr.sample.local-context.json
    ├── dfr.sample.expanded.json
    ├── dia.context.jsonld
    ├── dia.schema.json
    ├── dia.sample.json
    ├── dia.sample.local-context.json
    ├── dia.sample.expanded.json
    ├── dte.context.jsonld
    ├── dte.schema.json
    ├── dte.sample.json
    ├── dte.sample.local-context.json
    └── dte.sample.expanded.json
```

Note: `downloads/` is git-ignored to keep repository clean.

## Error Handling

- **Invalid versions**: Fails with HTTP 404 error
- **Invalid types**: Lists available types and exits
- **JSON Schema validation errors**: Shows detailed error paths and values
- **JSON-LD validation errors**: Reports all validation issues with property details
- **Protected term redefinition**: Shows specific context conflicts
- **Network issues**: Provides clear error messages
- **Context-only types**: Automatically detects and handles types with only context files

## Architecture

The tool uses a modular architecture:

```
scripts/
├── test-untp-version.js           (Main CLI orchestration)
└── lib/
    ├── artefact-config.js          (UNTP type configurations)
    ├── downloader.js              (File download functionality)
    ├── file-utils.js              (Path and file utilities)
    ├── json-schema-validator.js   (JSON Schema validation)
    └── jsonld-processor.js        (JSON-LD processing and expansion)
```

### Adding New UNTP Types

To add support for new UNTP credential types, add configuration to `scripts/lib/artefact-config.js`:

```javascript
newtype: {
  name: "New Type Name",
  baseUrl: (version) => `https://jargon.sh/user/unece/NewType/v/${version}/artefacts`,
  artefacts: {
    context: {
      urlPath: "jsonldContexts/NewType.jsonld?class=NewType",
      filename: "newtype.context.jsonld"
    },
    // ... schema and sample configurations
  },
  contextPattern: (version) => `https://test.uncefact.org/vocabulary/untp/newtype/${version}/`,
  localContextFile: "./newtype.context.jsonld"
}
```

## Dependencies

- `chalk` - Terminal colors and styling
- `ora` - Progress spinners
- `jsonld` - JSON-LD processing and validation
- `jsonld-cli` - Command-line JSON-LD tools
- `ajv` - JSON Schema validation with 2020-12 support
- `ajv-formats` - Additional format validators for AJV

## Development Workflow

The tool is designed for iterative development workflows:

1. **Download once**: Files are cached locally and won't be re-downloaded
2. **Modify contexts**: Edit downloaded context files locally
3. **Re-test**: Run the tool again to validate changes
4. **Preserve originals**: Original samples are never modified
5. **Local testing**: Local context samples allow offline validation

The tool respects manual changes to downloaded files and only regenerates the local context and expanded JSON-LD files on each run.

## Future Enhancements

- **Auto-dependency Resolution**: Automatically download core when credentials reference it
- **Cross-type Validation**: Validate relationships between credential types
- **Batch Processing**: Process multiple versions simultaneously
- **Integration Testing**: Validate credential chains and traceability links
- **RDF Vocabulary Support**: Support additional RDF/OWL vocabulary artefacts
- **Version Comparison**: Compare artefacts across versions to track changes
