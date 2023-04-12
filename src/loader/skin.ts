import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class Skin extends Loader.EElement {
        source: Loader.UrlLink | undefined;
        bindShapeMatrix: Float32Array = new Float32Array();
        sources: Loader.Source[] | undefined;
        joints: Loader.Joints | undefined;
        vertexWeights: Loader.VertexWeights | undefined;

        constructor() {
            super();
            this._className += "Skin|";
        }

        /**
        *   Parses a <skin> element.
        */
        static parse(node: Node, context: Loader.Context): Loader.Skin {
            var result: Loader.Skin = new Loader.Skin();

            result.source = context.getAttributeAsUrlLink(node, "source", true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "bind_shape_matrix":
                        result.bindShapeMatrix = context.getFloatsContent(child);
                        break;
                    case "source":
                        result.sources?.push(Loader.Source.parse(child, context));
                        break;
                    case "joints":
                        result.joints = Loader.Joints.parse(child, context);
                        break;
                    case "vertex_weights":
                        result.vertexWeights = Loader.VertexWeights.parse(child, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
