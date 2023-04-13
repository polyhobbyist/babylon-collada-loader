import * as COLLADAContext from "../context"
import {Log, LogLevel} from "../log"
import * as Loader from "../loader/loader"
import * as Converter from "../converter/converter"
import * as Exporter from "./exporter"
import * as Utils from "./utils"
import {BoundingBoxJSON} from "./format"

    export class BoundingBox {

        static toJSON(box: Converter.BoundingBox): BoundingBoxJSON {
            if (!box) {
                return {
                    min: [0, 0, 0],
                    max: [0, 0, 0]
                };
                }

            return {
                min: [box.min[0], box.min[1], box.min[2]],
                max: [box.max[0], box.max[1], box.max[2]]
            };
        }
    }

    export class Geometry {

        static toJSON(chunk: Converter.GeometryChunk, material_index: number, context: Exporter.ExporterContext): Exporter.GeometryJSON {

            var indices: Exporter.DataChunk = Exporter.DataChunk.create(chunk.data.indices, 3, context);
            var position: Exporter.DataChunk = Exporter.DataChunk.create(chunk.data.position, 3, context);
            var normal: Exporter.DataChunk = Exporter.DataChunk.create(chunk.data.normal, 3, context);
            var texcoord: Exporter.DataChunk = Exporter.DataChunk.create(chunk.data.texcoord, 2, context);
            var boneweight: Exporter.DataChunk = Exporter.DataChunk.create(chunk.data.boneweight, 4, context);
            var boneindex: Exporter.DataChunk = Exporter.DataChunk.create(chunk.data.boneindex, 4, context);

            return {
                name: chunk.name,
                material: material_index,
                vertex_count: chunk.vertexCount,
                triangle_count: chunk.triangleCount,
                indices: Exporter.DataChunk.toJSON(indices),
                position: Exporter.DataChunk.toJSON(position),
                normal: Exporter.DataChunk.toJSON(normal),
                texcoord: Exporter.DataChunk.toJSON(texcoord),
                boneweight: Exporter.DataChunk.toJSON(boneweight),
                boneindex: Exporter.DataChunk.toJSON(boneindex),
                bounding_box: BoundingBox.toJSON(chunk.boundingBox)
            }
        }
    }
