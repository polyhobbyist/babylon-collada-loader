/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="input.ts" />
/// <reference path="utils.ts" />

module COLLADA.Loader {

    export class VertexWeights extends COLLADA.Loader.Element {
        inputs: COLLADA.Loader.Input[];
        vcount: Int32Array = new Int32Array();
        v: Int32Array = new Int32Array();
        joints: COLLADA.Loader.Input | undefined = undefined;
        weights: COLLADA.Loader.Input | undefined = undefined;
        count: number = 0;

        constructor() {
            super();
            this._className += "VertexWeights|";
            this.inputs = [];
        }

        /**
        *   Parses a <vertex_weights> element.
        */
        static parse(node: Node, context: COLLADA.Loader.Context): COLLADA.Loader.VertexWeights {
            var result: COLLADA.Loader.VertexWeights = new COLLADA.Loader.VertexWeights();

            result.count = context.getAttributeAsInt(node, "count", 0, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "input":
                        var input: COLLADA.Loader.Input = COLLADA.Loader.Input.parse(child, true, context);
                        COLLADA.Loader.VertexWeights.addInput(result, input, context);
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

        static addInput(weights: COLLADA.Loader.VertexWeights, input: COLLADA.Loader.Input, context: COLLADA.Loader.Context) {
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
}