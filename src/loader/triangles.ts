import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class Triangles extends Loader.EElement {
        /** "triangles", "polylist", or "polygons" */
        type: string = "";
        count: number = 0;
        /** A material "symbol", bound by <bind_material> */
        material: string = "";
        inputs: Loader.Input[] = [];
        indices: Uint32Array = new Uint32Array();
        vcount: Uint32Array = new Uint32Array();

        constructor() {
            super();
            this._className += "Triangles|";
        }

        /**
        *   Parses a <triangles> element.
        */
        static parse(node: Node, context: Loader.LoaderContext): Loader.Triangles {
            var result: Loader.Triangles = new Loader.Triangles();

            result.name = context.getAttributeAsString(node, "name", undefined, false);
            result.material = context.getAttributeAsString(node, "material", undefined, false);
            result.count = context.getAttributeAsInt(node, "count", 0, true) || 0;
            result.type = node.nodeName;

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "input":
                        result.inputs.push(Loader.Input.parse(child, true, context));
                        break;
                    case "vcount":
                        result.vcount = context.getUintsContent(child);
                        break;
                    case "p":
                        result.indices = context.getUintsContent(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
