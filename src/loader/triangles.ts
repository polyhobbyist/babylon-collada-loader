/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="input.ts" />
/// <reference path="utils.ts" />

module COLLADA.Loader {

    export class Triangles extends COLLADA.Loader.Element {
        /** "triangles", "polylist", or "polygons" */
        type: string = "";
        count: number = 0;
        /** A material "symbol", bound by <bind_material> */
        material: string = "";
        inputs: COLLADA.Loader.Input[] | undefined = undefined;
        indices: Int32Array = new Int32Array();
        vcount: Int32Array = new Int32Array();

        constructor() {
            super();
            this._className += "Triangles|";
        }

        /**
        *   Parses a <triangles> element.
        */
        static parse(node: Node, context: COLLADA.Loader.Context): COLLADA.Loader.Triangles {
            var result: COLLADA.Loader.Triangles = new COLLADA.Loader.Triangles();

            result.name = context.getAttributeAsString(node, "name", undefined, false);
            result.material = context.getAttributeAsString(node, "material", undefined, false);
            result.count = context.getAttributeAsInt(node, "count", 0, true) || 0;
            result.type = node.nodeName;

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "input":
                        result.inputs?.push(COLLADA.Loader.Input.parse(child, true, context));
                        break;
                    case "vcount":
                        result.vcount = context.getIntsContent(child);
                        break;
                    case "p":
                        result.indices = context.getIntsContent(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
}