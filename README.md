# Jargon.sh artefact UNTP Testing Tool

A Node.js tool for downloading and validating UN Transparency Protocol (UNTP) files from the Jargon registry.

Example:
```console
$ npm run test-version -- working --types dpp

> test-version
> node scripts/test-untp-version.js working --types dpp


🧪 Testing UNTP files for version working (types: dpp)...


--- Processing DPP ---
✔ Downloaded dpp.context.jsonld (28.5 kB)
✔ Downloaded dpp.schema.json (45.1 kB)
✔ Downloaded dpp.vocabulary.jsonld (18.4 kB)
✔ Downloaded dpp.sample.json (24.1 kB)
✔ JSON Schema validation passed
✔ Created dpp.sample.local-context.json with local context
✔ Created dpp.sample.expanded.json
✓ Completed processing DPP

✅ Done! Files ready in downloads/working/

Files created for types: dpp

DPP files:
├── dpp.context.jsonld - JSON-LD context
├── dpp.vocabulary.jsonld - RDF vocabulary
├── dpp.schema.json - JSON Schema
├── dpp.sample.json - Original sample instance
├── dpp.sample.local-context.json - Sample with local context
└── dpp.sample.expanded.json - Expanded JSON-LD
```

## Features

I generated this tool just in the interim while we don't have automatic json-ld and schema validation in the
GitLab workflow (like we do in GitHub).

It's just a helper to pull the artefacts from Jargon and validate the data. There's an additional copy command
that I've used to copy the validated data to the correctly locations of my local spec-untp branch, making it
simple to create a diff for a PR.

The JSON-LD validation happens by:
- Making a copy of the Jargon generated sample data
- updating that copy so that rather than pointing to the published context file (or the URI where the context would be published), it instead points at the locally downloaded context file
- uses the [json-ld](https://github.com/digitalbazaar/jsonld.js) tool to expand the sample (with the `--safe` option to ensure it errors if there are any warnings)

The JSON-Schema validation is done with the [ajv library](https://github.com/ajv-validator/ajv).


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


### Adding New UNTP Types

In case it's useful when adding extensions to check...

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

## Development Workflow

The tool is designed for iterative development workflows:

1. **Download once**: Files are cached locally and won't be re-downloaded
2. **Modify contexts**: Edit downloaded context files locally if there are local patches to the Jargon output
3. **Re-test**: Run the tool again to validate changes
4. **Preserve originals**: Original samples are never modified
5. **Local testing**: Local context samples allow offline validation

The tool respects manual changes to downloaded files and only regenerates the local context and expanded JSON-LD files on each run.
