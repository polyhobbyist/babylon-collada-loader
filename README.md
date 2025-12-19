# collada-gltf-converter

A simple and efficient library for converting Collada (.dae) files to glTF 2.0 format.

## Features

- **Simple Architecture**: Direct conversion from Collada XML to glTF 2.0 JSON
- **No Heavy Dependencies**: Removed Babylon.js dependencies for a lightweight package
- **Pure TypeScript**: Fully typed for great IDE support
- **Browser & Node.js**: Works in both environments

## Installation

```bash
npm install @polyhobbyist/collada-gltf-converter
```

## Usage

### Basic Conversion

```typescript
import { convertColladaToGLTF, convertColladaToGLTFString } from '@polyhobbyist/collada-gltf-converter';

// From XML string to glTF object
const colladaXml = '<?xml version="1.0"?>...';
const gltf = convertColladaToGLTF(colladaXml);

// From XML string to glTF JSON string
const gltfJson = convertColladaToGLTFString(colladaXml);
console.log(gltfJson);
```

### With Options

```typescript
import { convertColladaToGLTF, LogLevel } from '@polyhobbyist/collada-gltf-converter';

const gltf = convertColladaToGLTF(colladaXml, {
    logLevel: LogLevel.Debug,
    logCallback: (message, level) => {
        console.log(`[${level}] ${message}`);
    }
});
```

### Using with Babylon.js

To use Collada files in Babylon.js, first convert them to glTF, then load with Babylon's glTF loader:

```typescript
import { convertColladaToGLTFString } from '@polyhobbyist/collada-gltf-converter';
import { SceneLoader } from 'babylonjs';

// Convert Collada to glTF
const gltfJson = convertColladaToGLTFString(colladaXml);

// Load into Babylon.js scene
SceneLoader.ImportMesh(
    "",
    "data:" + gltfJson,
    "",
    scene,
    (meshes) => {
        console.log("Loaded meshes:", meshes);
    }
);
```

## API Reference

### convertColladaToGLTF(colladaXml, options?)

Converts Collada XML to glTF 2.0 JSON object.

**Parameters:**
- `colladaXml`: string | XMLDocument - The Collada XML content
- `options`: ConversionOptions (optional)
  - `logLevel`: LogLevel - Logging verbosity
  - `logCallback`: (message: string, level: LogLevel) => void - Custom log handler

**Returns:** GLTF2.IGLTF - glTF 2.0 JSON object

### convertColladaToGLTFString(colladaXml, options?, pretty?)

Converts Collada XML to glTF JSON string.

**Parameters:**
- `colladaXml`: string | XMLDocument - The Collada XML content  
- `options`: ConversionOptions (optional)
- `pretty`: boolean (default: true) - Pretty-print the JSON

**Returns:** string - Formatted glTF JSON

## Architecture

The library uses a simplified 2-phase architecture:

1. **Loader Phase**: Parses Collada XML into a DOM structure
2. **Exporter Phase**: Converts the DOM directly to glTF 2.0 format

This is much simpler than the previous 3-phase architecture that involved intermediate conversions through Babylon.js.

## Supported Features

- ✅ Meshes (triangles, polylist)
- ✅ Materials (Phong, Lambert, Blinn)
- ✅ Textures
- ✅ Scene hierarchy
- ✅ Transformations
- 🚧 Skinned meshes (planned)
- 🚧 Animations (planned)

## Migration from babylon-collada-loader

If you were using the old `@polyhobbyist/babylon-collada-loader` package, here's how to migrate:

### Old Way (v0.x):
```typescript
import { DAEFileLoader } from '@polyhobbyist/babylon-collada-loader';

const loader = new DAEFileLoader();
SceneLoader.RegisterPlugin(loader);
```

### New Way (v1.x):
```typescript
import { convertColladaToGLTFString } from '@polyhobbyist/collada-gltf-converter';

const gltfJson = convertColladaToGLTFString(colladaXml);
// Use Babylon's built-in glTF loader
```

## License

MIT

## Credits

This work is based on https://github.com/rmx/collada-converter, updated to modern TypeScript with a simplified glTF export architecture.
