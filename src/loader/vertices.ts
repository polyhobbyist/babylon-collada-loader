import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class Vertices extends Loader.EElement {
        inputs: Loader.Input[];

        constructor() {
            super();
            this._className += "Vertices|";
            this.inputs = [];
        }

        static fromLink(link: Loader.Link, context: Context): Loader.Vertices | undefined {
            return Loader.EElement._fromLink<Loader.Vertices>(link, "Vertices", context);
        }

        /**
        *   Parses a <vertices> element.
        */
        static parse(node: Node, context: Loader.Context): Loader.Vertices {
            var result: Loader.Vertices = new Loader.Vertices();

            result.id = context.getAttributeAsString(node, "id", "", true);
            result.name = context.getAttributeAsString(node, "name", "", false);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "input":
                        result.inputs.push(Loader.Input.parse(child, false, context));
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
