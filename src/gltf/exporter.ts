/**
 * glTF 2.0 Exporter for Collada Documents
 * Simplified architecture that converts Collada DOM directly to glTF
 */

import { Document as ColladaDocument } from '../loader/document';
import { VisualScene } from '../loader/visual_scene';
import { VisualSceneNode } from '../loader/visual_scene_node';
import { Geometry } from '../loader/geometry';
import { Material as ColladaMaterial } from '../loader/material';
import { Effect } from '../loader/effect';
import { Source } from '../loader/source';
import { Triangles } from '../loader/triangles';
import { Vertices } from '../loader/vertices';
import { Input } from '../loader/input';
import { GLTF2 } from './types';

export class GLTFExporter {
    private buffers: ArrayBuffer[] = [];
    private bufferViews: GLTF2.IBufferView[] = [];
    private accessors: GLTF2.IAccessor[] = [];
    private meshes: GLTF2.IMesh[] = [];
    private materials: GLTF2.IMaterial[] = [];
    private nodes: GLTF2.INode[] = [];
    private scenes: GLTF2.IScene[] = [];
    
    private currentBufferOffset = 0;
    private materialCache = new Map<string, number>();
    private geometryCache = new Map<string, number>();

    /**
     * Export Collada document to glTF 2.0
     */
    export(colladaDoc: ColladaDocument): GLTF2.IGLTF {
        if (!colladaDoc.scene) {
            throw new Error("Collada document has no scene");
        }

        // Get the visual scene
        const visualScene = VisualScene.fromLink(colladaDoc.scene.instance, null);
        if (!visualScene) {
            throw new Error("Could not load visual scene");
        }

        // Process the scene hierarchy
        const sceneNodeIndices: number[] = [];
        for (const node of visualScene.children) {
            const nodeIndex = this.processNode(node, colladaDoc);
            if (nodeIndex !== -1) {
                sceneNodeIndices.push(nodeIndex);
            }
        }

        // Create the main scene
        this.scenes.push({
            nodes: sceneNodeIndices,
            name: visualScene.name || "Scene"
        });

        // Combine all buffers into one
        const combinedBuffer = this.combineBuffers();

        // Build the glTF structure
        const gltf: GLTF2.IGLTF = {
            asset: {
                version: "2.0",
                generator: "Collada to glTF Converter"
            },
            scene: 0,
            scenes: this.scenes,
            nodes: this.nodes,
            meshes: this.meshes.length > 0 ? this.meshes : undefined,
            materials: this.materials.length > 0 ? this.materials : undefined,
            accessors: this.accessors.length > 0 ? this.accessors : undefined,
            bufferViews: this.bufferViews.length > 0 ? this.bufferViews : undefined,
            buffers: combinedBuffer ? [combinedBuffer] : undefined
        };

        return gltf;
    }

    /**
     * Process a visual scene node recursively
     */
    private processNode(colladaNode: VisualSceneNode, doc: ColladaDocument): number {
        const nodeIndex = this.nodes.length;

        const gltfNode: GLTF2.INode = {
            name: colladaNode.name || `Node_${nodeIndex}`
        };

        // Process transform (simplified - identity matrix for now)
        if (colladaNode.transformations && colladaNode.transformations.length > 0) {
            // TODO: Compute actual transform matrix from Collada transforms
            // For now, using identity
        }

        // Process geometry instances
        if (colladaNode.geometries && colladaNode.geometries.length > 0) {
            for (const geomInst of colladaNode.geometries) {
                const meshIndex = this.processGeometry(geomInst, doc);
                if (meshIndex !== -1) {
                    gltfNode.mesh = meshIndex;
                    break; // Only first geometry for now
                }
            }
        }

        // Process children
        const childIndices: number[] = [];
        if (colladaNode.children) {
            for (const child of colladaNode.children) {
                const childIndex = this.processNode(child, doc);
                if (childIndex !== -1) {
                    childIndices.push(childIndex);
                }
            }
        }
        
        if (childIndices.length > 0) {
            gltfNode.children = childIndices;
        }

        this.nodes.push(gltfNode);
        return nodeIndex;
    }

    /**
     * Process geometry instance
     */
    private processGeometry(geometryInstance: any, doc: ColladaDocument): number {
        const geometry = Geometry.fromLink(geometryInstance.geometry, null);
        if (!geometry) {
            return -1;
        }

        const cacheKey = geometry.id || `geo_${this.meshes.length}`;
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey)!;
        }

        const meshIndex = this.meshes.length;
        const primitives: GLTF2.IMeshPrimitive[] = [];

        // Process each primitive set (triangles, polylist, etc.)
        for (const triangles of geometry.triangles) {
            const primitive = this.processTriangles(triangles, geometry, doc);
            if (primitive) {
                primitives.push(primitive);
            }
        }

        if (primitives.length > 0) {
            this.meshes.push({
                name: geometry.name || cacheKey,
                primitives: primitives
            });
            this.geometryCache.set(cacheKey, meshIndex);
            return meshIndex;
        }

        return -1;
    }

    /**
     * Process triangle primitive
     */
    private processTriangles(triangles: Triangles, geometry: Geometry, doc: ColladaDocument): GLTF2.IMeshPrimitive | null {
        const primitive: GLTF2.IMeshPrimitive = {
            attributes: {},
            mode: 4 // TRIANGLES
        };

        // Get the vertices element
        if (!geometry.vertices || geometry.vertices.length === 0) {
            return null;
        }
        const vertices = geometry.vertices[0];

        // Process each input to build vertex data
        const vertexInputs = triangles.inputs;
        
        for (const input of vertexInputs) {
            const source = Source.fromLink(input.source, null);
            if (!source || !source.data) {
                continue;
            }

            const typedData = source.data as Float32Array;
            
            switch (input.semantic) {
                case "VERTEX":
                    // VERTEX references the vertices element, which contains inputs
                    for (const vertexInput of vertices.inputs) {
                        const vertSource = Source.fromLink(vertexInput.source, null);
                        if (!vertSource || !vertSource.data) continue;
                        
                        const vertData = vertSource.data as Float32Array;
                        const stride = vertSource.stride || 3;
                        const count = vertSource.count || (vertData.length / stride);
                        
                        if (vertexInput.semantic === "POSITION") {
                            const accessorIndex = this.createAccessor(
                                vertData,
                                "VEC3",
                                5126, // FLOAT
                                count
                            );
                            primitive.attributes["POSITION"] = accessorIndex;
                        }
                    }
                    break;
                    
                case "NORMAL":
                    const normalStride = source.stride || 3;
                    const normalCount = source.count || (typedData.length / normalStride);
                    const accessorIndex = this.createAccessor(
                        typedData,
                        "VEC3",
                        5126, // FLOAT
                        normalCount
                    );
                    primitive.attributes["NORMAL"] = accessorIndex;
                    break;
                    
                case "TEXCOORD":
                    const texStride = source.stride || 2;
                    const texCount = source.count || (typedData.length / texStride);
                    const texAccessorIndex = this.createAccessor(
                        typedData,
                        "VEC2",
                        5126, // FLOAT
                        texCount
                    );
                    primitive.attributes["TEXCOORD_0"] = texAccessorIndex;
                    break;
            }
        }

        // Process indices
        if (triangles.indices && triangles.indices.length > 0) {
            // Collada indices may be interleaved if there are multiple inputs
            // We need to extract only the vertex indices
            const inputCount = triangles.inputs.length;
            const indexCount = triangles.count * 3; // 3 vertices per triangle
            
            let indices: Uint16Array;
            if (inputCount === 1) {
                // Simple case: only one input, direct copy
                indices = new Uint16Array(triangles.indices);
            } else {
                // Complex case: interleaved indices, extract vertex indices
                indices = new Uint16Array(indexCount);
                let vertexOffset = 0;
                for (const input of triangles.inputs) {
                    if (input.semantic === "VERTEX") {
                        vertexOffset = input.offset || 0;
                        break;
                    }
                }
                
                for (let i = 0; i < indexCount; i++) {
                    indices[i] = triangles.indices[i * inputCount + vertexOffset];
                }
            }
            
            const accessorIndex = this.createAccessor(
                indices,
                "SCALAR",
                5123, // UNSIGNED_SHORT
                indices.length
            );
            primitive.indices = accessorIndex;
        }

        // Process material
        if (triangles.material) {
            const materialIndex = this.processMaterial(triangles.material, doc);
            if (materialIndex !== -1) {
                primitive.material = materialIndex;
            }
        }

        return primitive;
    }

    /**
     * Process material
     */
    private processMaterial(materialSymbol: string, doc: ColladaDocument): number {
        if (this.materialCache.has(materialSymbol)) {
            return this.materialCache.get(materialSymbol)!;
        }

        // Find material in document
        const colladaMaterial = doc.libMaterials.children.find(m => m.id === materialSymbol || m.name === materialSymbol);
        if (!colladaMaterial) {
            return -1;
        }

        const materialIndex = this.materials.length;
        const gltfMaterial: GLTF2.IMaterial = {
            name: colladaMaterial.name || materialSymbol,
            pbrMetallicRoughness: {
                baseColorFactor: [1, 1, 1, 1],
                metallicFactor: 0,
                roughnessFactor: 1
            }
        };

        // Get effect
        const effect = Effect.fromLink(colladaMaterial.effect, null);
        if (effect && effect.technique) {
            // Process diffuse
            if (effect.technique.diffuse && effect.technique.diffuse.color) {
                const color = effect.technique.diffuse.color;
                if (color && color.length >= 3) {
                    gltfMaterial.pbrMetallicRoughness!.baseColorFactor = [
                        color[0], color[1], color[2], color.length > 3 ? color[3] : 1
                    ];
                }
            }

            // Process emission
            if (effect.technique.emission && effect.technique.emission.color) {
                const color = effect.technique.emission.color;
                if (color && color.length >= 3) {
                    gltfMaterial.emissiveFactor = [color[0], color[1], color[2]];
                }
            }
        }

        this.materials.push(gltfMaterial);
        this.materialCache.set(materialSymbol, materialIndex);
        return materialIndex;
    }

    /**
     * Create accessor for typed array data
     */
    private createAccessor(
        data: Float32Array | Uint16Array | Uint8Array | number[],
        type: string,
        componentType: number,
        count: number
    ): number {
        // Create buffer view
        const typedArray = data instanceof Array ? new Float32Array(data) : data;
        const bufferViewIndex = this.createBufferView(typedArray);

        // Compute min/max for position data
        let min: number[] | undefined;
        let max: number[] | undefined;
        
        if (type === "VEC3" && typedArray instanceof Float32Array) {
            min = [Infinity, Infinity, Infinity];
            max = [-Infinity, -Infinity, -Infinity];
            for (let i = 0; i < count; i++) {
                for (let j = 0; j < 3; j++) {
                    const value = typedArray[i * 3 + j];
                    min[j] = Math.min(min[j], value);
                    max[j] = Math.max(max[j], value);
                }
            }
        }

        const accessor: GLTF2.IAccessor = {
            bufferView: bufferViewIndex,
            componentType: componentType,
            count: count,
            type: type,
            min: min,
            max: max
        };

        const accessorIndex = this.accessors.length;
        this.accessors.push(accessor);
        return accessorIndex;
    }

    /**
     * Create buffer view for typed array
     */
    private createBufferView(data: Float32Array | Uint16Array | Uint8Array): number {
        const byteLength = data.byteLength;
        const byteOffset = this.currentBufferOffset;

        const bufferView: GLTF2.IBufferView = {
            buffer: 0,
            byteOffset: byteOffset,
            byteLength: byteLength
        };

        const bufferViewIndex = this.bufferViews.length;
        this.bufferViews.push(bufferView);

        // Store buffer data
        const buffer = data.buffer as ArrayBuffer;
        this.buffers.push(buffer.slice(data.byteOffset, data.byteOffset + byteLength));
        this.currentBufferOffset += byteLength;

        return bufferViewIndex;
    }

    /**
     * Combine all buffers into a single buffer
     */
    private combineBuffers(): GLTF2.IBuffer | undefined {
        if (this.buffers.length === 0) {
            return undefined;
        }

        const totalLength = this.buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
        const combined = new Uint8Array(totalLength);
        
        let offset = 0;
        for (const buffer of this.buffers) {
            combined.set(new Uint8Array(buffer), offset);
            offset += buffer.byteLength;
        }

        // Convert to base64 data URI
        const base64 = this.arrayBufferToBase64(combined.buffer);
        
        return {
            byteLength: totalLength,
            uri: `data:application/octet-stream;base64,${base64}`
        };
    }

    /**
     * Convert ArrayBuffer to base64 string
     */
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}
