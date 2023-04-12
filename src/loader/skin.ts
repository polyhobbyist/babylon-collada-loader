/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="source.ts" />
/// <reference path="joints.ts" />
/// <reference path="vertex_weights.ts" />
/// <reference path="utils.ts" />

module COLLADA.Loader {

    export class Skin extends COLLADA.Loader.EElement {
        source: UrlLink | undefined;
        bindShapeMatrix: Float32Array = new Float32Array();
        sources: COLLADA.Loader.Source[] | undefined;
        joints: COLLADA.Loader.Joints | undefined;
        vertexWeights: COLLADA.Loader.VertexWeights | undefined;

        constructor() {
            super();
            this._className += "Skin|";
        }

        /**
        *   Parses a <skin> element.
        */
        static parse(node: Node, context: COLLADA.Loader.Context): COLLADA.Loader.Skin {
            var result: COLLADA.Loader.Skin = new COLLADA.Loader.Skin();

            result.source = context.getAttributeAsUrlLink(node, "source", true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "bind_shape_matrix":
                        result.bindShapeMatrix = context.getFloatsContent(child);
                        break;
                    case "source":
                        result.sources?.push(COLLADA.Loader.Source.parse(child, context));
                        break;
                    case "joints":
                        result.joints = COLLADA.Loader.Joints.parse(child, context);
                        break;
                    case "vertex_weights":
                        result.vertexWeights = COLLADA.Loader.VertexWeights.parse(child, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
}