/**
 * Integration tests for the glTF exporter
 * Tests more complex scenarios and real-world Collada features
 */

import { convertColladaToGLTF } from './collada2gltf';
import { GLTF2 } from './gltf/types';

describe('glTF Exporter Integration Tests', () => {
    describe('Materials', () => {
        const colladaWithMaterial = `<?xml version="1.0" encoding="utf-8"?>
<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
    <asset>
        <up_axis>Z_UP</up_axis>
    </asset>
    <library_effects>
        <effect id="material-effect">
            <profile_COMMON>
                <technique sid="common">
                    <phong>
                        <emission>
                            <color>0.1 0.1 0.1 1</color>
                        </emission>
                        <ambient>
                            <color>0.2 0.2 0.2 1</color>
                        </ambient>
                        <diffuse>
                            <color>0.8 0.2 0.2 1</color>
                        </diffuse>
                        <specular>
                            <color>0.5 0.5 0.5 1</color>
                        </specular>
                    </phong>
                </technique>
            </profile_COMMON>
        </effect>
    </library_effects>
    <library_materials>
        <material id="material1" name="RedMaterial">
            <instance_effect url="#material-effect"/>
        </material>
    </library_materials>
    <library_geometries>
        <geometry id="cube-mesh" name="Cube">
            <mesh>
                <source id="positions">
                    <float_array id="positions-array" count="24">
                        -1 -1 -1 1 -1 -1 1 1 -1 -1 1 -1 -1 -1 1 1 -1 1 1 1 1 -1 1 1
                    </float_array>
                    <technique_common>
                        <accessor source="#positions-array" count="8" stride="3">
                            <param name="X" type="float"/>
                            <param name="Y" type="float"/>
                            <param name="Z" type="float"/>
                        </accessor>
                    </technique_common>
                </source>
                <vertices id="vertices">
                    <input semantic="POSITION" source="#positions"/>
                </vertices>
                <triangles material="material1" count="2">
                    <input semantic="VERTEX" source="#vertices" offset="0"/>
                    <p>0 1 2 0 2 3</p>
                </triangles>
            </mesh>
        </geometry>
    </library_geometries>
    <library_visual_scenes>
        <visual_scene id="Scene">
            <node id="Cube" name="Cube">
                <instance_geometry url="#cube-mesh">
                    <bind_material>
                        <technique_common>
                            <instance_material symbol="material1" target="#material1"/>
                        </technique_common>
                    </bind_material>
                </instance_geometry>
            </node>
        </visual_scene>
    </library_visual_scenes>
    <scene>
        <instance_visual_scene url="#Scene"/>
    </scene>
</COLLADA>`;

        it('should convert materials to glTF PBR', () => {
            const gltf = convertColladaToGLTF(colladaWithMaterial);

            expect(gltf.materials).toBeDefined();
            expect(gltf.materials!.length).toBeGreaterThan(0);

            const material = gltf.materials![0];
            expect(material.pbrMetallicRoughness).toBeDefined();
        });

        it('should convert diffuse color to base color', () => {
            const gltf = convertColladaToGLTF(colladaWithMaterial);

            const material = gltf.materials![0];
            const baseColor = material.pbrMetallicRoughness!.baseColorFactor;
            
            expect(baseColor).toBeDefined();
            expect(baseColor![0]).toBeCloseTo(0.8, 5); // Red channel
            expect(baseColor![1]).toBeCloseTo(0.2, 5); // Green channel
            expect(baseColor![2]).toBeCloseTo(0.2, 5); // Blue channel
        });

        it('should convert emission color', () => {
            const gltf = convertColladaToGLTF(colladaWithMaterial);

            const material = gltf.materials![0];
            const emissive = material.emissiveFactor;
            
            expect(emissive).toBeDefined();
            expect(emissive![0]).toBeCloseTo(0.1, 5);
            expect(emissive![1]).toBeCloseTo(0.1, 5);
            expect(emissive![2]).toBeCloseTo(0.1, 5);
        });

        it('should set metallic factor to 0 for Phong materials', () => {
            const gltf = convertColladaToGLTF(colladaWithMaterial);

            const material = gltf.materials![0];
            expect(material.pbrMetallicRoughness!.metallicFactor).toBe(0);
        });
    });

    describe('Scene Hierarchy', () => {
        const colladaWithHierarchy = `<?xml version="1.0" encoding="utf-8"?>
<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
    <asset>
        <up_axis>Z_UP</up_axis>
    </asset>
    <library_geometries>
        <geometry id="mesh1">
            <mesh>
                <source id="pos1">
                    <float_array id="pos1-array" count="9">0 0 0 1 0 0 0 1 0</float_array>
                    <technique_common>
                        <accessor source="#pos1-array" count="3" stride="3">
                            <param name="X" type="float"/>
                            <param name="Y" type="float"/>
                            <param name="Z" type="float"/>
                        </accessor>
                    </technique_common>
                </source>
                <vertices id="verts1">
                    <input semantic="POSITION" source="#pos1"/>
                </vertices>
                <triangles count="1">
                    <input semantic="VERTEX" source="#verts1" offset="0"/>
                    <p>0 1 2</p>
                </triangles>
            </mesh>
        </geometry>
    </library_geometries>
    <library_visual_scenes>
        <visual_scene id="Scene">
            <node id="Root" name="Root">
                <node id="Child1" name="Child1">
                    <instance_geometry url="#mesh1"/>
                    <node id="GrandChild" name="GrandChild">
                        <instance_geometry url="#mesh1"/>
                    </node>
                </node>
                <node id="Child2" name="Child2">
                    <instance_geometry url="#mesh1"/>
                </node>
            </node>
        </visual_scene>
    </library_visual_scenes>
    <scene>
        <instance_visual_scene url="#Scene"/>
    </scene>
</COLLADA>`;

        it('should preserve scene hierarchy', () => {
            const gltf = convertColladaToGLTF(colladaWithHierarchy);

            expect(gltf.nodes).toBeDefined();
            expect(gltf.nodes!.length).toBeGreaterThan(1);
        });

        it('should create parent-child relationships', () => {
            const gltf = convertColladaToGLTF(colladaWithHierarchy);

            // Find nodes with children
            const nodesWithChildren = gltf.nodes!.filter(node => node.children && node.children.length > 0);
            expect(nodesWithChildren.length).toBeGreaterThan(0);
        });

        it('should have scene root nodes', () => {
            const gltf = convertColladaToGLTF(colladaWithHierarchy);

            expect(gltf.scenes).toBeDefined();
            expect(gltf.scenes![0].nodes).toBeDefined();
            expect(gltf.scenes![0].nodes!.length).toBeGreaterThan(0);
        });
    });

    describe('Multiple Primitives', () => {
        const colladaWithMultiplePrimitives = `<?xml version="1.0" encoding="utf-8"?>
<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
    <asset>
        <up_axis>Z_UP</up_axis>
    </asset>
    <library_geometries>
        <geometry id="mesh1">
            <mesh>
                <source id="pos">
                    <float_array id="pos-array" count="12">0 0 0 1 0 0 1 1 0 0 1 0</float_array>
                    <technique_common>
                        <accessor source="#pos-array" count="4" stride="3">
                            <param name="X" type="float"/>
                            <param name="Y" type="float"/>
                            <param name="Z" type="float"/>
                        </accessor>
                    </technique_common>
                </source>
                <vertices id="verts">
                    <input semantic="POSITION" source="#pos"/>
                </vertices>
                <triangles count="1">
                    <input semantic="VERTEX" source="#verts" offset="0"/>
                    <p>0 1 2</p>
                </triangles>
                <triangles count="1">
                    <input semantic="VERTEX" source="#verts" offset="0"/>
                    <p>0 2 3</p>
                </triangles>
            </mesh>
        </geometry>
    </library_geometries>
    <library_visual_scenes>
        <visual_scene id="Scene">
            <node id="Node" name="Node">
                <instance_geometry url="#mesh1"/>
            </node>
        </visual_scene>
    </library_visual_scenes>
    <scene>
        <instance_visual_scene url="#Scene"/>
    </scene>
</COLLADA>`;

        it('should handle multiple triangle sets', () => {
            const gltf = convertColladaToGLTF(colladaWithMultiplePrimitives);

            expect(gltf.meshes).toBeDefined();
            expect(gltf.meshes![0].primitives.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Texture Coordinates', () => {
        const colladaWithTexCoords = `<?xml version="1.0" encoding="utf-8"?>
<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
    <asset>
        <up_axis>Z_UP</up_axis>
    </asset>
    <library_geometries>
        <geometry id="mesh1">
            <mesh>
                <source id="pos">
                    <float_array id="pos-array" count="9">0 0 0 1 0 0 0 1 0</float_array>
                    <technique_common>
                        <accessor source="#pos-array" count="3" stride="3">
                            <param name="X" type="float"/>
                            <param name="Y" type="float"/>
                            <param name="Z" type="float"/>
                        </accessor>
                    </technique_common>
                </source>
                <source id="uv">
                    <float_array id="uv-array" count="6">0 0 1 0 0 1</float_array>
                    <technique_common>
                        <accessor source="#uv-array" count="3" stride="2">
                            <param name="S" type="float"/>
                            <param name="T" type="float"/>
                        </accessor>
                    </technique_common>
                </source>
                <vertices id="verts">
                    <input semantic="POSITION" source="#pos"/>
                </vertices>
                <triangles count="1">
                    <input semantic="VERTEX" source="#verts" offset="0"/>
                    <input semantic="TEXCOORD" source="#uv" offset="0" set="0"/>
                    <p>0 1 2</p>
                </triangles>
            </mesh>
        </geometry>
    </library_geometries>
    <library_visual_scenes>
        <visual_scene id="Scene">
            <node id="Node">
                <instance_geometry url="#mesh1"/>
            </node>
        </visual_scene>
    </library_visual_scenes>
    <scene>
        <instance_visual_scene url="#Scene"/>
    </scene>
</COLLADA>`;

        it('should export texture coordinates', () => {
            const gltf = convertColladaToGLTF(colladaWithTexCoords);

            const primitive = gltf.meshes![0].primitives[0];
            expect(primitive.attributes.TEXCOORD_0).toBeDefined();
        });

        it('should create accessor for UVs', () => {
            const gltf = convertColladaToGLTF(colladaWithTexCoords);

            const primitive = gltf.meshes![0].primitives[0];
            const uvAccessorIndex = primitive.attributes.TEXCOORD_0;
            
            expect(uvAccessorIndex).toBeLessThan(gltf.accessors!.length);
            
            const uvAccessor = gltf.accessors![uvAccessorIndex];
            expect(uvAccessor.type).toBe('VEC2');
        });
    });

    describe('Normals', () => {
        const colladaWithNormals = `<?xml version="1.0" encoding="utf-8"?>
<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
    <asset>
        <up_axis>Z_UP</up_axis>
    </asset>
    <library_geometries>
        <geometry id="mesh1">
            <mesh>
                <source id="pos">
                    <float_array id="pos-array" count="9">0 0 0 1 0 0 0 1 0</float_array>
                    <technique_common>
                        <accessor source="#pos-array" count="3" stride="3">
                            <param name="X" type="float"/>
                            <param name="Y" type="float"/>
                            <param name="Z" type="float"/>
                        </accessor>
                    </technique_common>
                </source>
                <source id="normals">
                    <float_array id="normals-array" count="9">0 0 1 0 0 1 0 0 1</float_array>
                    <technique_common>
                        <accessor source="#normals-array" count="3" stride="3">
                            <param name="X" type="float"/>
                            <param name="Y" type="float"/>
                            <param name="Z" type="float"/>
                        </accessor>
                    </technique_common>
                </source>
                <vertices id="verts">
                    <input semantic="POSITION" source="#pos"/>
                </vertices>
                <triangles count="1">
                    <input semantic="VERTEX" source="#verts" offset="0"/>
                    <input semantic="NORMAL" source="#normals" offset="0"/>
                    <p>0 1 2</p>
                </triangles>
            </mesh>
        </geometry>
    </library_geometries>
    <library_visual_scenes>
        <visual_scene id="Scene">
            <node id="Node">
                <instance_geometry url="#mesh1"/>
            </node>
        </visual_scene>
    </library_visual_scenes>
    <scene>
        <instance_visual_scene url="#Scene"/>
    </scene>
</COLLADA>`;

        it('should export normals', () => {
            const gltf = convertColladaToGLTF(colladaWithNormals);

            const primitive = gltf.meshes![0].primitives[0];
            expect(primitive.attributes.NORMAL).toBeDefined();
        });

        it('should create VEC3 accessor for normals', () => {
            const gltf = convertColladaToGLTF(colladaWithNormals);

            const primitive = gltf.meshes![0].primitives[0];
            const normalAccessorIndex = primitive.attributes.NORMAL;
            
            const normalAccessor = gltf.accessors![normalAccessorIndex];
            expect(normalAccessor.type).toBe('VEC3');
        });
    });

    describe('Performance', () => {
        it('should convert simple scene in reasonable time', () => {
            const simpleCollada = `<?xml version="1.0"?>
<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
    <asset><up_axis>Z_UP</up_axis></asset>
    <library_geometries>
        <geometry id="m"><mesh>
            <source id="p"><float_array id="pa" count="9">0 0 0 1 0 0 0 1 0</float_array>
                <technique_common><accessor source="#pa" count="3" stride="3">
                    <param name="X" type="float"/><param name="Y" type="float"/><param name="Z" type="float"/>
                </accessor></technique_common></source>
            <vertices id="v"><input semantic="POSITION" source="#p"/></vertices>
            <triangles count="1"><input semantic="VERTEX" source="#v" offset="0"/><p>0 1 2</p></triangles>
        </mesh></geometry>
    </library_geometries>
    <library_visual_scenes><visual_scene id="S">
        <node id="N"><instance_geometry url="#m"/></node>
    </visual_scene></library_visual_scenes>
    <scene><instance_visual_scene url="#S"/></scene>
</COLLADA>`;

            const startTime = performance.now();
            convertColladaToGLTF(simpleCollada);
            const endTime = performance.now();
            
            const duration = endTime - startTime;
            expect(duration).toBeLessThan(100); // Should complete in less than 100ms
        });
    });
});
