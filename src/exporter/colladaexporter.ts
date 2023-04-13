import { promises as fs } from 'fs';
import * as BABYLON from "babylonjs";
import * as Exporter from "./exporter"
import * as Converter from "../converter/converter"
import {RMXModelLoader} from "../model-loader"
import {RMXModel} from "../model"
import * as Utils from "./utils"
import {Log, LogLevel, LogConsole, LogCallback, LogFilter} from "../log"

    export class ColladaExporter {
        log: Log;

        constructor() {
            this.log = new LogConsole();
        }

        export(doc: Converter.Document): Exporter.Document {
            var context: Exporter.ExporterContext = new Exporter.ExporterContext(this.log);

            if (!doc) {
                context.log.write("No document to convert", LogLevel.Warning);
                return null;
            }

            if (doc.geometries.length === 0) {
                context.log.write("Document contains no geometry, nothing exported", LogLevel.Warning);
                return null;
            } else if (doc.geometries.length > 1) {
                context.log.write("Document contains multiple geometries, only the first geometry is exported", LogLevel.Warning);
            }

            // Geometry and materials
            var converter_materials: Converter.Material[] = [];
            var materials: Exporter.MaterialJSON[] = [];
            var converter_geometry: Converter.Geometry = doc.geometries[0];
            var chunks: Exporter.GeometryJSON[] = [];

            for (var c: number = 0; c < converter_geometry.chunks.length; ++c) {
                var chunk: Converter.GeometryChunk = converter_geometry.chunks[c];

                // Create the material, if it does not exist yet
                var material_index: number = converter_materials.indexOf(chunk.material);
                if (material_index === -1) {
                    var material: Exporter.MaterialJSON = Exporter.Material.toJSON(chunk.material, context);
                    material_index = materials.length;

                    converter_materials.push(chunk.material);
                    materials.push(material);
                }

                // Create the geometry
                chunks.push(Exporter.Geometry.toJSON(chunk, material_index, context));
            }

            // Result
            var result: Exporter.Document = new Exporter.Document();

            var info: Exporter.InfoJSON = {
                bounding_box: Exporter.BoundingBox.toJSON(converter_geometry.boundingBox)
            };
            var bones: Exporter.BoneJSON[] = Exporter.Skeleton.toJSON(converter_geometry.getSkeleton(), context);
            var animations: Exporter.AnimationJSON[] = doc.resampled_animations.map((e) => Exporter.Animation.toJSON(e, context));

            // Assemble result: JSON part
            result.json = {
                info: info,
                materials: materials,
                chunks: chunks,
                bones: bones,
                animations: animations
            };

            // Assemble result: Binary data part
            result.data = context.assembleData();
            //result.json.data = Exporter.Utils.bufferToString(result.data);

            return result;
        }
    }
