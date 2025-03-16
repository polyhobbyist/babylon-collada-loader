import {Context} from "./context"
import {LogLevel} from "./log"
import * as Model from "./model"
import * as ModelAnimation from "./model-animation"
import * as BABYLON from 'babylonjs';

/**
* Converts a RMXModel into corresponding three.js objects
*/
export class BabylonModelLoader {

    private materialCache: { [hash: string]: BABYLON.Material };

    constructor() {
        this.materialCache = {};
    }

    private createGeometry(chunk: Model.RMXModelChunk, scene : BABYLON.Scene): BABYLON.VertexData {
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

            // reverse the winding order
            for (var i = 0; i < vertexData.indices.length; i += 3) {
                var tmp = vertexData.indices[i];
                vertexData.indices[i] = vertexData.indices[i + 2];
                vertexData.indices[i + 2] = tmp;
            }
        }

        return vertexData;
    }

    private createTexture(url: string, scene : BABYLON.Scene): BABYLON.Texture {
        if ((url == null)  || (url == "")) {
            return new BABYLON.Texture("", scene);
        }

        // TODO Polyhobbyist

        return new BABYLON.Texture(url, scene);
    }

    private parseColor(color: string) : BABYLON.Color3 {
        color = color.trim();
        var rgba = color.split(' ');
        if (rgba.length >= 3) {
            throw new Error("Color ${rgba} does not have 3 values")
        }
    
        return new BABYLON.Color3(parseFloat(rgba[0]), parseFloat(rgba[1]), parseFloat(rgba[2]));
    }

    private createMaterial(material: Model.RMXMaterial, skinned: boolean, scene : BABYLON.Scene): BABYLON.Material {
        var prefix = skinned ? "skinned-" : "static-";
        var hash = prefix + material.hash();
        var cached_material = this.materialCache[hash];

        if (cached_material) {
            return cached_material;
        } else {
            var result = new BABYLON.StandardMaterial(hash, scene);
            //result.skinning = skinned;
            if (material.diffuse) {
                result.diffuseTexture = this.createTexture(material.diffuse, scene);
            }

            if (material.specular) {
                result.specularTexture = this.createTexture(material.specular, scene);
            }

            if (material.diffuseColor != undefined && material.diffuseColor.length == 4) {
                result.diffuseColor = new BABYLON.Color3(material.diffuseColor[0], material.diffuseColor[1], material.diffuseColor[2]);
            }

            if (material.emissiveColor != undefined && material.emissiveColor.length == 4) {
                result.emissiveColor = new BABYLON.Color3(material.emissiveColor[0], material.emissiveColor[1], material.emissiveColor[2]);
            }

            if (material.specularColor != undefined && material.specularColor.length == 4) {
                result.specularColor = new BABYLON.Color3(material.specularColor[0], material.specularColor[1], material.specularColor[2])
            }

            this.materialCache[hash] = result;
            return result;
        }
    }

    createBabylonModel(model: Model.RMXModel, scene : BABYLON.Scene): BabylonModel {
        var result = new BabylonModel();
        var skinned = model.skeleton? true : false;

        // Create root transform node
        let transformNodes: BABYLON.TransformNode[] = [];
        
        // Create transform hierarchy instead of skeleton
        if (model.skeleton) {
            
            // First pass: create all transform nodes
            for (var i = 0; i < model.skeleton.bones.length; ++i) {
                var bone = model.skeleton.bones[i];
                let boneMatrix = BABYLON.Matrix.FromArray(bone.matrix);
                
                let transformNode = new BABYLON.TransformNode(bone.name, scene);
                transformNode.setPreTransformMatrix(boneMatrix);
                transformNodes.push(transformNode);
            }
            
            // Second pass: set up parent relationships
            for (var i = 0; i < model.skeleton.bones.length; ++i) {
                var bone = model.skeleton.bones[i];
                if (bone.parent >= 0 && bone.parent < transformNodes.length) {
                    transformNodes[i].parent = transformNodes[bone.parent];
                }
            }
        }

        result.transformNodes = transformNodes;

        // Geometry
        for (var i = 0; i < model.chunks.length; ++i) {
            var rmx_chunk = model.chunks[i];
            var chunk = new BabylonModelChunk;
            chunk.geometry = this.createGeometry(rmx_chunk, scene);
            chunk.material = this.createMaterial(model.materials[rmx_chunk.material_index], skinned, scene);
            result.chunks.push(chunk);

            if (chunk.geometry) {
                var m = new BABYLON.Mesh(rmx_chunk.name, scene);
                chunk.geometry.applyToMesh(m);
                m.material = chunk.material;
                result.meshes.push(m);

                var normals = m.getVerticesData(BABYLON.VertexBuffer.NormalKind);
                var positions = m.getVerticesData(BABYLON.VertexBuffer.PositionKind);

                BABYLON.VertexData.ComputeNormals(positions, m.getIndices(), normals, { useRightHandedSystem: scene.useRightHandedSystem });
                m.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
                m.convertToFlatShadedMesh();
                m.sideOrientation = BABYLON.Material.CounterClockWiseSideOrientation;

                // Attach mesh to transform nodes instead of bones
                if (result.transformNodes) {
                    var bone_indices = rmx_chunk.data_boneindex;
                    if (bone_indices) {
                        var bone_count = bone_indices.length / 4;
                        for (var j = 0; j < bone_count; ++j) {
                            var bone_index = bone_indices[j * 4];
                            if (bone_index >= 0 && bone_index < result.transformNodes.length) {
                                m.parent = result.transformNodes[bone_index];
                            }
                        }
                    }
                }
            }
        }

        // Animation - store for later use
        result.animations = model.animations;
        return result;
    }
}

/**
* A custom class that replaces THREE.Skeleton with transforms
*/
export class BabylonSkeleton {
    boneTexture: ModelAnimation.RMXBoneMatrixTexture;
    skeleton: Model.RMXSkeleton;
    pose: ModelAnimation.RMXPose;
    transformNodes: BABYLON.TransformNode[];

    constructor(skeleton: Model.RMXSkeleton, transformNodes: BABYLON.TransformNode[]) {
        this.skeleton = skeleton;
        this.transformNodes = transformNodes;
        this.pose = new ModelAnimation.RMXPose(skeleton.bones.length);
        ModelAnimation.RMXSkeletalAnimation.resetPose(this.skeleton, this.pose);
        this.boneTexture = new ModelAnimation.RMXBoneMatrixTexture(skeleton.bones.length);
    }

    update(gl: WebGLRenderingContext) {
        ModelAnimation.RMXSkeletalAnimation.exportPose(this.skeleton, this.pose, this.boneTexture.data);
        // Update transform nodes based on pose
        for (let i = 0; i < this.transformNodes.length; i++) {
            const pos = new BABYLON.Vector3(
                this.pose.pos[i * 3],
                this.pose.pos[i * 3 + 1],
                this.pose.pos[i * 3 + 2]
            );
            const rot = new BABYLON.Quaternion(
                this.pose.rot[i * 4],
                this.pose.rot[i * 4 + 1],
                this.pose.rot[i * 4 + 2],
                this.pose.rot[i * 4 + 3]
            );
            const scl = new BABYLON.Vector3(
                this.pose.scl[i * 3],
                this.pose.scl[i * 3 + 1],
                this.pose.scl[i * 3 + 2]
            );
            
            this.transformNodes[i].position = pos;
            this.transformNodes[i].rotationQuaternion = rot;
            this.transformNodes[i].scaling = scl;
        }
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
* A factory for producing models using transform nodes instead of skeletons
*/
export class BabylonModel {
    chunks: BabylonModelChunk[];
    transformNodes: BABYLON.TransformNode[] | undefined;
    rootNode: BABYLON.TransformNode;
    animations: Model.RMXAnimation[];
    static identityMatrix: BABYLON.Matrix = new BABYLON.Matrix();
    meshes: BABYLON.AbstractMesh[] = [];

    constructor() {
        this.chunks = [];
        this.transformNodes = undefined;
        this.animations = [];
    }
}
