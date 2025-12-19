# Migration Guide: Babylon Collada Loader → Collada glTF Converter

## Overview

This library has been significantly simplified and refactored to export glTF 2.0 format instead of directly loading into Babylon.js.

## What Changed

### Architecture Simplification

**Before (v0.x):**
```
Collada XML → Loader → Converter → Exporter → Babylon.js Loader → Scene
```

**After (v1.x):**
```
Collada XML → Loader → glTF Exporter → glTF JSON
```

Then use Babylon.js's built-in glTF loader to load into your scene.

### Key Benefits

1. **Simpler codebase**: Removed complex 3-phase architecture
2. **No Babylon.js dependency**: Library is now framework-agnostic
3. **Standard output**: glTF 2.0 is an industry standard
4. **Better maintainability**: Fewer dependencies, clearer code

## Migration Steps

### 1. Update Package Name

```bash
# Uninstall old package
npm uninstall @polyhobbyist/babylon-collada-loader

# Install new package
npm install @polyhobbyist/collada-gltf-converter
```

### 2. Update Imports

**Before:**
```typescript
import { DAEFileLoader, Register } from '@polyhobbyist/babylon-collada-loader';
```

**After:**
```typescript
import { convertColladaToGLTF } from '@polyhobbyist/collada-gltf-converter';
```

### 3. Update Loading Code

**Before:**
```typescript
import { DAEFileLoader } from '@polyhobbyist/babylon-collada-loader';
import * as BABYLON from 'babylonjs';

// Register the loader
const loader = new DAEFileLoader();
BABYLON.SceneLoader.RegisterPlugin(loader);

// Load the file
BABYLON.SceneLoader.ImportMesh(
    "",
    "path/to/",
    "model.dae",
    scene,
    (meshes) => {
        console.log("Loaded:", meshes);
    }
);
```

**After:**
```typescript
import { convertColladaToGLTFString } from '@polyhobbyist/collada-gltf-converter';
import * as BABYLON from 'babylonjs';

// Load Collada file content (example using fetch)
const response = await fetch('path/to/model.dae');
const colladaXml = await response.text();

// Convert to glTF
const gltfJson = convertColladaToGLTFString(colladaXml);

// Load using Babylon's glTF loader
const gltfBlob = new Blob([gltfJson], { type: 'application/json' });
const gltfUrl = URL.createObjectURL(gltfBlob);

BABYLON.SceneLoader.ImportMesh(
    "",
    gltfUrl,
    "",
    scene,
    (meshes) => {
        console.log("Loaded:", meshes);
        URL.revokeObjectURL(gltfUrl);
    }
);
```

### 4. Update Logging (if used)

**Before:**
```typescript
import { LogLevel, LogCallback } from '@polyhobbyist/babylon-collada-loader';

const logCallback = new LogCallback();
logCallback.onmessage = (message, level) => {
    console.log(message);
};
```

**After:**
```typescript
import { convertColladaToGLTF, LogLevel } from '@polyhobbyist/collada-gltf-converter';

const gltf = convertColladaToGLTF(colladaXml, {
    logLevel: LogLevel.Debug,
    logCallback: (message, level) => {
        console.log(message);
    }
});
```

## Breaking Changes

### Removed

- ❌ `DAEFileLoader` class
- ❌ `Register()` function
- ❌ Direct Babylon.js integration
- ❌ All `babylon-*` dependencies
- ❌ `converter/` folder and classes
- ❌ `exporter/` folder (old exporter)
- ❌ `babylon-loader.ts`
- ❌ `model.ts`, `model-loader.ts`, `model-animation.ts`

### Added

- ✅ `convertColladaToGLTF()` - Convert to glTF object
- ✅ `convertColladaToGLTFString()` - Convert to glTF JSON string
- ✅ `gltf/` folder with glTF 2.0 exporter
- ✅ `GLTF2` type definitions

### Changed

- 📝 Package name: `@polyhobbyist/babylon-collada-loader` → `@polyhobbyist/collada-gltf-converter`
- 📝 Main export: `dist/dae.js` → `dist/collada2gltf.js`
- 📝 Output format: Babylon.js objects → glTF 2.0 JSON

## Advantages of New Approach

1. **Simpler code**: 2-phase vs 3-phase architecture
2. **Framework agnostic**: Can be used with Three.js, Babylon.js, or any glTF-compatible engine
3. **Standard format**: glTF is an industry standard
4. **Smaller bundle**: No Babylon.js dependencies
5. **Better caching**: glTF can be cached and reused
6. **Easier testing**: JSON output is easier to validate

## Example: Complete Migration

Here's a complete before/after example:

### Before (v0.x)

```typescript
import * as BABYLON from 'babylonjs';
import { DAEFileLoader } from '@polyhobbyist/babylon-collada-loader';

const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// Setup camera, lights, etc.
const camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
camera.attachControl(canvas, true);
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// Register Collada loader
const loader = new DAEFileLoader();
BABYLON.SceneLoader.RegisterPlugin(loader);

// Load model
BABYLON.SceneLoader.ImportMesh("", "./models/", "robot.dae", scene, 
    (meshes) => {
        console.log("Model loaded:", meshes);
    },
    null,
    (scene, message) => {
        console.error("Error loading:", message);
    }
);

engine.runRenderLoop(() => {
    scene.render();
});
```

### After (v1.x)

```typescript
import * as BABYLON from 'babylonjs';
import { convertColladaToGLTFString } from '@polyhobbyist/collada-gltf-converter';

const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// Setup camera, lights, etc.
const camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
camera.attachControl(canvas, true);
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// Load and convert Collada file
async function loadColladaModel() {
    try {
        // Fetch Collada file
        const response = await fetch('./models/robot.dae');
        const colladaXml = await response.text();
        
        // Convert to glTF
        const gltfJson = convertColladaToGLTFString(colladaXml);
        
        // Create blob URL for glTF
        const blob = new Blob([gltfJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Load using Babylon's glTF loader (which is built-in)
        BABYLON.SceneLoader.ImportMesh("", url, "", scene,
            (meshes) => {
                console.log("Model loaded:", meshes);
                URL.revokeObjectURL(url); // Clean up
            },
            null,
            (scene, message) => {
                console.error("Error loading:", message);
                URL.revokeObjectURL(url);
            }
        );
    } catch (error) {
        console.error("Error:", error);
    }
}

loadColladaModel();

engine.runRenderLoop(() => {
    scene.render();
});
```

## Need Help?

If you have questions or issues during migration, please file an issue on GitHub:
https://github.com/polyhobbyist/babylon-collada-loader/issues
