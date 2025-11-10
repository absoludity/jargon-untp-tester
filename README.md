# UNTP Testing Tool

A Node.js tool for downloading and validating UN Transparency Protocol (UNTP)
files from the Jargon registry during development.

It's really just a temporary helper for downloading Jargon artefacts while we
don't have the great CI which we had on github available on the new gitlab repo.

TODO: we could even make this just a downloader and integrate the recently
integrated untp-tests functionality for the testing - I'll add that next.

## Features

### Current Functionality

- Downloads UNTP Digital Product Passport (DPP) files for any version
- Smart caching: only downloads files that don't already exist
- Validates JSON-LD expansion with comprehensive error reporting
- Updates sample files to use local context files for offline testing
- Organizes downloads by version in `downloads/` directory

### Files Downloaded per Version

For each version (e.g., `0.6.1`), the tool downloads:

- `dpp.context.jsonld` - JSON-LD context definitions
- `dpp.schema.json` - JSON Schema for validation
- `dpp.sample.json` - Sample instance data
- `dpp.sample.expanded.json` - Expanded JSON-LD (generated locally)

## Installation

```bash
npm install
```

## Usage

### Via npm script (recommended)
```bash
npm run test-version -- <version>
```

### Direct execution
```bash
node scripts/test-untp-version.js <version>
```

### Examples
```bash
# Test stable version
npm run test-version -- 0.6.1

# Test development version
npm run test-version -- working
```

## Validation Process

1. Downloads required files (if not already present)
2. Updates sample file to reference local context
3. Runs JSON-LD expansion in safe mode for strict validation
4. If validation fails, re-runs in warning mode to collect all errors
5. Reports comprehensive validation issues with specific property details

## Directory Structure

```
downloads/
├── 0.6.1/
│   ├── dpp.context.jsonld
│   ├── dpp.schema.json
│   ├── dpp.sample.json
│   └── dpp.sample.expanded.json
└── working/
    ├── dpp.context.jsonld
    ├── dpp.schema.json
    └── dpp.sample.json
```

Note: `downloads/` is git-ignored to keep repository clean.

## Error Handling

- Invalid versions: Fails with HTTP 404 error
- Validation errors: Reports all issues with specific property names and reasons
- Network issues: Provides clear error messages with retry suggestions

## Future Plans

### Generalization for All UNTP Types

The tool will be extended to support the full range of UNTP specifications:

#### Planned UNTP Types
- **Digital Product Passport (DPP)** - Currently supported
- **Digital Conformity Credential (DCC)** - Planned
- **Digital Traceability Event (DTE)** - Planned
- **Digital Facility Record (DFR)** - Planned

#### Planned Enhancements

1. **Multi-type Downloads**
   ```bash
   npm run test-version -- 0.6.1 --types dpp,dcc,dte
   npm run test-version -- 0.6.1 --all
   ```

2. **Shared Context Management**
   - Download shared `core.context.jsonld` once per version
   - Each type will reference shared contexts appropriately

3. **Cross-type Validation**
   - Validate interactions between different UNTP types
   - Test credential chains and traceability links

4. **Enhanced File Organization**
   ```
   downloads/
   └── 0.6.1/
       ├── core.context.jsonld
       ├── dpp.context.jsonld
       ├── dpp.schema.json
       ├── dpp.sample.json
       ├── dpp.sample.expanded.json
       ├── dcc.context.jsonld
       ├── dcc.schema.json
       ├── dcc.sample.json
       └── dcc.sample.expanded.json
   ```

5. **Comprehensive Testing Suite**
   - Validate all types in a version
   - Check for consistency across types
   - Generate compatibility reports

## Dependencies

- `chalk` - Terminal colors and styling
- `ora` - Progress spinners
- `jsonld` - JSON-LD processing and validation
- `jsonld-cli` - Command-line JSON-LD tools

## Development

The tool is designed for iterative testing workflows where files may be modified locally and re-tested. It respects manual changes to downloaded files and only overwrites the expanded JSON-LD output on each test run.
