/// <reference path="context.ts" />
/// <reference path="format.ts" />

module COLLADA.Exporter {

    export class Material {

        static toJSON(material: COLLADA.Converter.Material, context: COLLADA.Exporter.Context): COLLADA.Exporter.MaterialJSON | undefined{
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
}