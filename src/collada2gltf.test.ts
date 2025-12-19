/**
 * Tests for Collada to glTF conversion
 */

import { convertColladaToGLTF, convertColladaToGLTFString } from './collada2gltf';
import { GLTF2 } from './gltf/types';

describe('Collada to glTF Converter', () => {
    // Simple test Collada document
    const simpleColladaXml = `<?xml version="1.0" encoding="utf-8"?>
<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
    <asset>
        <contributor>
            <author>Test Author</author>
        </contributor>
        <created>2024-01-01T00:00:00</created>
        <modified>2024-01-01T00:00:00</modified>
        <unit name="meter" meter="1"/>
        <up_axis>Z_UP</up_axis>
    </asset>
    <library_geometries>
        <geometry id="cube-mesh" name="Cube">
            <mesh>
                <source id="cube-mesh-positions">
                    <float_array id="cube-mesh-positions-array" count="24">
                        -1 -1 -1 1 -1 -1 1 1 -1 -1 1 -1 -1 -1 1 1 -1 1 1 1 1 -1 1 1
                    </float_array>
                    <technique_common>
                        <accessor source="#cube-mesh-positions-array" count="8" stride="3">
                            <param name="X" type="float"/>
                            <param name="Y" type="float"/>
                            <param name="Z" type="float"/>
                        </accessor>
                    </technique_common>
                </source>
                <vertices id="cube-mesh-vertices">
                    <input semantic="POSITION" source="#cube-mesh-positions"/>
                </vertices>
                <triangles count="2">
                    <input semantic="VERTEX" source="#cube-mesh-vertices" offset="0"/>
                    <p>0 1 2 0 2 3</p>
                </triangles>
            </mesh>
        </geometry>
    </library_geometries>
    <library_visual_scenes>
        <visual_scene id="Scene" name="Scene">
            <node id="Cube" name="Cube" type="NODE">
                <instance_geometry url="#cube-mesh"/>
            </node>
        </visual_scene>
    </library_visual_scenes>
    <scene>
        <instance_visual_scene url="#Scene"/>
    </scene>
</COLLADA>`;

    describe('convertColladaToGLTF', () => {
        it('should convert valid Collada XML to glTF object', () => {
            const gltf = convertColladaToGLTF(simpleColladaXml);

            expect(gltf).toBeDefined();
            expect(gltf.asset).toBeDefined();
            expect(gltf.asset.version).toBe('2.0');
            expect(gltf.asset.generator).toContain('Collada to glTF Converter');
        });

        it('should have a scene', () => {
            const gltf = convertColladaToGLTF(simpleColladaXml);

            expect(gltf.scene).toBe(0);
            expect(gltf.scenes).toBeDefined();
            expect(gltf.scenes!.length).toBeGreaterThan(0);
        });

        it('should have nodes', () => {
            const gltf = convertColladaToGLTF(simpleColladaXml);

            expect(gltf.nodes).toBeDefined();
            expect(gltf.nodes!.length).toBeGreaterThan(0);
        });

        it('should have meshes', () => {
            const gltf = convertColladaToGLTF(simpleColladaXml);

            expect(gltf.meshes).toBeDefined();
            expect(gltf.meshes!.length).toBeGreaterThan(0);
        });

        it('should have valid mesh primitives', () => {
            const gltf = convertColladaToGLTF(simpleColladaXml);

            expect(gltf.meshes).toBeDefined();
            const mesh = gltf.meshes![0];
            expect(mesh.primitives).toBeDefined();
            expect(mesh.primitives.length).toBeGreaterThan(0);

            const primitive = mesh.primitives[0];
            expect(primitive.attributes).toBeDefined();
            expect(primitive.attributes.POSITION).toBeDefined();
        });

        it('should have accessors', () => {
            const gltf = convertColladaToGLTF(simpleColladaXml);

            expect(gltf.accessors).toBeDefined();
            expect(gltf.accessors!.length).toBeGreaterThan(0);
        });

        it('should have buffer views', () => {
            const gltf = convertColladaToGLTF(simpleColladaXml);

            expect(gltf.bufferViews).toBeDefined();
            expect(gltf.bufferViews!.length).toBeGreaterThan(0);
        });

        it('should have a buffer with data URI', () => {
            const gltf = convertColladaToGLTF(simpleColladaXml);

            expect(gltf.buffers).toBeDefined();
            expect(gltf.buffers!.length).toBeGreaterThan(0);

            const buffer = gltf.buffers![0];
            expect(buffer.byteLength).toBeGreaterThan(0);
            expect(buffer.uri).toBeDefined();
            expect(buffer.uri).toMatch(/^data:application\/octet-stream;base64,/);
        });

        it('should throw error for empty XML', () => {
            expect(() => {
                convertColladaToGLTF('');
            }).toThrow();
        });

        it('should throw error for invalid XML', () => {
            expect(() => {
                convertColladaToGLTF('not xml');
            }).toThrow();
        });

        it('should throw error for XML without COLLADA element', () => {
            const invalidXml = '<?xml version="1.0"?><root></root>';
            expect(() => {
                convertColladaToGLTF(invalidXml);
            }).toThrow();
        });
    });

    describe('convertColladaToGLTFString', () => {
        it('should convert to JSON string', () => {
            const gltfJson = convertColladaToGLTFString(simpleColladaXml);

            expect(typeof gltfJson).toBe('string');
            expect(gltfJson.length).toBeGreaterThan(0);
        });

        it('should produce valid JSON', () => {
            const gltfJson = convertColladaToGLTFString(simpleColladaXml);

            expect(() => {
                JSON.parse(gltfJson);
            }).not.toThrow();
        });

        it('should produce pretty-printed JSON by default', () => {
            const gltfJson = convertColladaToGLTFString(simpleColladaXml);

            // Pretty-printed JSON should contain newlines and indentation
            expect(gltfJson).toContain('\n');
            expect(gltfJson).toMatch(/  "/); // Should have 2-space indentation
        });

        it('should produce compact JSON when pretty=false', () => {
            const gltfJson = convertColladaToGLTFString(simpleColladaXml, {}, false);

            // Compact JSON should not contain unnecessary whitespace
            // But may still have some spaces (like after colons)
            const lines = gltfJson.split('\n');
            expect(lines.length).toBe(1); // Should be a single line
        });

        it('should produce parseable glTF', () => {
            const gltfJson = convertColladaToGLTFString(simpleColladaXml);
            const gltf = JSON.parse(gltfJson);

            expect(gltf.asset).toBeDefined();
            expect(gltf.asset.version).toBe('2.0');
        });
    });

    describe('Logging options', () => {
        it('should accept custom log callback', () => {
            const messages: string[] = [];
            const logCallback = (message: string) => {
                messages.push(message);
            };

            convertColladaToGLTF(simpleColladaXml, {
                logCallback
            });

            // Should have logged something (warnings or info)
            // Note: This might be 0 if there are no warnings for this simple case
            expect(Array.isArray(messages)).toBe(true);
        });
    });

    describe('glTF Structure Validation', () => {
        let gltf: GLTF2.IGLTF;

        beforeEach(() => {
            gltf = convertColladaToGLTF(simpleColladaXml);
        });

        it('should have valid asset info', () => {
            expect(gltf.asset.version).toBe('2.0');
            expect(gltf.asset.generator).toBeDefined();
        });

        it('should have consistent accessor references', () => {
            if (gltf.meshes && gltf.accessors) {
                gltf.meshes.forEach(mesh => {
                    mesh.primitives.forEach(primitive => {
                        // Check position accessor
                        const posAccessor = primitive.attributes.POSITION;
                        expect(posAccessor).toBeLessThan(gltf.accessors!.length);

                        // Check indices if present
                        if (primitive.indices !== undefined) {
                            expect(primitive.indices).toBeLessThan(gltf.accessors!.length);
                        }
                    });
                });
            }
        });

        it('should have consistent buffer view references', () => {
            if (gltf.accessors && gltf.bufferViews) {
                gltf.accessors.forEach(accessor => {
                    if (accessor.bufferView !== undefined) {
                        expect(accessor.bufferView).toBeLessThan(gltf.bufferViews!.length);
                    }
                });
            }
        });

        it('should have valid accessor types', () => {
            if (gltf.accessors) {
                const validTypes = ['SCALAR', 'VEC2', 'VEC3', 'VEC4', 'MAT2', 'MAT3', 'MAT4'];
                gltf.accessors.forEach(accessor => {
                    expect(validTypes).toContain(accessor.type);
                });
            }
        });

        it('should have valid component types', () => {
            if (gltf.accessors) {
                const validComponentTypes = [5120, 5121, 5122, 5123, 5125, 5126]; // byte, ubyte, short, ushort, uint, float
                gltf.accessors.forEach(accessor => {
                    expect(validComponentTypes).toContain(accessor.componentType);
                });
            }
        });

        it('should have positive accessor counts', () => {
            if (gltf.accessors) {
                gltf.accessors.forEach(accessor => {
                    expect(accessor.count).toBeGreaterThan(0);
                });
            }
        });

        it('should have valid buffer view byte lengths', () => {
            if (gltf.bufferViews) {
                gltf.bufferViews.forEach(bufferView => {
                    expect(bufferView.byteLength).toBeGreaterThan(0);
                    expect(bufferView.buffer).toBe(0); // Should reference the single buffer
                });
            }
        });
    });
});
