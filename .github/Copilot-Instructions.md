# Collada to glTF Converter

This repository contains a lightweight library for converting Collada (.dae) files to glTF 2.0 format.

It is a pure TypeScript implementation with a simplified 2-phase architecture:

1. **Loader Phase**: Parses Collada XML into a DOM structure (implemented in the `loader/` folder)
2. **Exporter Phase**: Converts the DOM directly to glTF 2.0 JSON format (implemented in the `gltf/` folder)

## Architecture

The library was previously a complex 3-phase system adapted from the KronosGroup's Collada DOM parser that exported to Babylon.js. It has been simplified to:

- **No Babylon.js dependency**: The library now exports standard glTF 2.0 format
- **Direct conversion**: Collada DOM → glTF JSON (no intermediate formats)
- **Lightweight**: Removed unnecessary complexity from the original general-purpose parser

## Key Files

- `src/collada2gltf.ts`: Main entry point with `convertColladaToGLTF()` function
- `src/gltf/exporter.ts`: glTF 2.0 exporter that converts Collada DOM to glTF
- `src/gltf/types.ts`: TypeScript definitions for glTF 2.0 format
- `src/loader/`: Collada XML parser (simplified from KronosGroup parser)
- `src/loader/document.ts`: Main Collada document structure

## Usage

Babylon.js support is provided through glTF, not as a direct loader. Users convert Collada → glTF → Babylon.js using the built-in Babylon.js glTF loader.

