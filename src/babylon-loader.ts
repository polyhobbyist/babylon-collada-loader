/// <reference path="model-loader.ts" />

import * as BABYLON from 'babylonjs';

/**
* Converts a RMXModel into corresponding three.js objects
*/
export class BabylonModelLoader {

    private materialCache: { [hash: string]: BABYLON.Material };
    //private imageLoader: THREE.ImageLoader;

    constructor() {
        this.materialCache = {};
    }

    private createGeometry(chunk: COLLADA.RMXModelChunk, scene : BABYLON.Scene): BABYLON.VertexData {
        var vertexData = new BABYLON.VertexData();

        if (chunk.data_position) {
            vertexData.positions = chunk.data_position;
        }
        if (chunk.data_normal) {
            vertexData.normals = chunk.data_normal;
        }
        if (chunk.data_texcoord) {
            vertexData.uvs = chunk.data_texcoord;
        }
        if (chunk.data_boneindex) {
            //result.addAttribute("skinIndex", new THREE.BufferAttribute(chunk.data_boneindex, 4));
        }
        if (chunk.data_boneindex) {
            //result.addAttribute("skinWeight", new THREE.BufferAttribute(chunk.data_boneweight, 4));
        }
        if (chunk.data_indices) {
            vertexData.indices = chunk.data_indices;
        }

        return vertexData;
    }

    private createTexture(url: string, scene : BABYLON.Scene): BABYLON.Texture {
        if (url == null || url == "") {
            return new BABYLON.Texture("", scene);
        }

        return new BABYLON.Texture("url", scene);
    }

    private createMaterial(material: COLLADA.RMXMaterial, skinned: boolean, scene : BABYLON.Scene): BABYLON.Material {
        var prefix = skinned ? "skinned-" : "static-";
        var hash = prefix + material.hash();
        var cached_material = this.materialCache[hash];

        if (cached_material) {
            return cached_material;
        } else {
            var result = new BABYLON.StandardMaterial(hash, scene);
            //result.skinning = skinned;
            result.diffuseColor  = new BABYLON.Color3(0.8, 0.8, 0.8);

            this.materialCache[hash] = result;
            return result;
        }
    }

    createModel(model: COLLADA.RMXModel, scene : BABYLON.Scene): BabylonModel {
        var result = new BabylonModel();
        var skinned = model.skeleton != null;

        // Geometry - create THREE objects
        for (var i = 0; i < model.chunks.length; ++i) {
            var rmx_chunk = model.chunks[i];

            var chunk = new BabylonModelChunk;
            chunk.geometry = this.createGeometry(rmx_chunk, scene);
            chunk.material = this.createMaterial(model.materials[rmx_chunk.material_index], skinned, scene);
            result.chunks.push(chunk);
        }

        // Skeleton - use custom object
        result.skeleton = model.skeleton;

        // Animation - use custom object
        result.animations = model.animations;

        return result;
    }
}

/**
* A custom class that replaces THREE.Skeleton
*/
export class BabylonSkeleton {
    boneTexture: COLLADA.RMXBoneMatrixTexture;
    skeleton: COLLADA.RMXSkeleton;
    pose: COLLADA.RMXPose;

    constructor(skeleton: COLLADA.RMXSkeleton) {
        // The skeleton stores information about the hiearchy of the bones
        this.skeleton = skeleton;

        // The pose stores information about the current bone transformations
        this.pose = new COLLADA.RMXPose(skeleton.bones.length);
        COLLADA.RMXSkeletalAnimation.resetPose(this.skeleton, this.pose);

        // The bone texture stores the bone matrices for the use on the GPU
        this.boneTexture = new COLLADA.RMXBoneMatrixTexture(skeleton.bones.length);

        /* 
        // Trick three.js into thinking this is a THREE.Skeleton object
        Object.defineProperty(this, "useVertexTexture", { get: function () { return true; } });
        Object.defineProperty(this, "boneTextureWidth", { get: function () { return this.boneTexture.size; } });
        Object.defineProperty(this, "boneTextureHeight", { get: function () { return this.boneTexture.size; } });

        // Trick three.js into thinking our bone texture is a THREE.DataTexture
        Object.defineProperty(this.boneTexture, "__webglTexture", { get: function () { return this.texture; } });
        Object.defineProperty(this.boneTexture, "needsUpdate", { get: function () { return false; } });
        Object.defineProperty(this.boneTexture, "width", { get: function () { return this.size; } });
        Object.defineProperty(this.boneTexture, "height", { get: function () { return this.size; } });
        */
    }

    update(gl: WebGLRenderingContext) {
        // Compute the bone matrices
        COLLADA.RMXSkeletalAnimation.exportPose(this.skeleton, this.pose, this.boneTexture.data);

        // Upload the bone matrices to the bone texture
        this.boneTexture.update(gl);
    }
}

/**
* Stores information about a piece of geometry
*/
class BabylonModelChunk {
    geometry: BABYLON.VertexData | undefined = undefined;
    material: BABYLON.Material | undefined = undefined;

    constructor() {
    }
}

export class BabylonModelInstance {
    model: BabylonModel;
    skeleton: BabylonSkeleton | undefined;

    constructor(model: BabylonModel, skeleton: BabylonSkeleton | undefined) {
        this.model = model;
        this.skeleton = skeleton;
    }
}

/**
* A factory for producing objects that behave like THREE.SkinnedMesh
*/
export class BabylonModel {
    chunks: BabylonModelChunk[];
    skeleton: COLLADA.RMXSkeleton | undefined;
    animations: COLLADA.RMXAnimation[];
    static identityMatrix: BABYLON.Matrix = new BABYLON.Matrix();

    constructor() {
        this.chunks = [];
        this.skeleton = undefined;
        this.animations = [];
    }

    instanciate(scene : BABYLON.Scene): BABYLON.Mesh {
        // Create one container object.
        var result = new BABYLON.Mesh("", scene);

        // Create one custom skeleton object.
        var skeleton: BabylonSkeleton | undefined = undefined;
        if (this.skeleton) {
            skeleton = new BabylonSkeleton(this.skeleton);
        }

        for (var i = 0; i < this.chunks.length; ++i) {
            var chunk = this.chunks[i];
            if (chunk.geometry) {
                chunk.geometry.applyToMesh(result);
            }
            // chunk.material;
            // BABYLON.MultiMaterial
        }

        // Store the custom skeleton in the container object.
        result.metadata = new BabylonModelInstance(this, skeleton);

        return result;
    }
}
