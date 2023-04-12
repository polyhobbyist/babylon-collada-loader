import * as Converter from "../converter/converter"
import * as Exporter from "./exporter"

    export class Material {

        static toJSON(material: Converter.Material, context: Exporter.Context): Exporter.MaterialJSON | undefined{
            if (material === null) {
                return null;
            }

            return {
                name: material.name,
                diffuse: (material.diffuse !== null) ? (material.diffuse.url) : "",
                specular: (material.specular !== null) ? (material.specular.url) : "",
                normal: (material.normal !== null) ? (material.normal.url) : ""
            };
        }
    };
