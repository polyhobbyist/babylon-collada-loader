import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class VertexWeights extends Loader.EElement {
        inputs: Loader.Input[];
        vcount: Int32Array = new Int32Array();
        v: Int32Array = new Int32Array();
        joints: Loader.Input | undefined = undefined;
        weights: Loader.Input | undefined = undefined;
        count: number = 0;

        constructor() {
            super();
            this._className += "VertexWeights|";
            this.inputs = [];
        }

        /**
        *   Parses a <vertex_weights> element.
        */
        static parse(node: Node, context: Loader.LoaderContext): Loader.VertexWeights {
            var result: Loader.VertexWeights = new Loader.VertexWeights();

            result.count = context.getAttributeAsInt(node, "count", 0, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "input":
                        var input: Loader.Input = Loader.Input.parse(child, true, context);
                        Loader.VertexWeights.addInput(result, input, context);
                        break;
                    case "vcount":
                        result.vcount = context.getIntsContent(child);
                        break;
                    case "v":
                        result.v = context.getIntsContent(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

        static addInput(weights: Loader.VertexWeights, input: Loader.Input, context: Loader.LoaderContext) {
            switch (input.semantic) {
                case "JOINT":
                    weights.joints = input;
                    break;
                case "WEIGHT":
                    weights.weights = input;
                    break;
                default:
                    context.log.write("Unknown vertex weights input semantic " + input.semantic, LogLevel.Error);
            }
        }
    }
