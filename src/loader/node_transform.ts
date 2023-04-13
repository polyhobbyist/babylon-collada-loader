import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class NodeTransform extends Loader.EElement {
        type: string | undefined;
        data: Float32Array | undefined;

        constructor() {
            super();
            this._className += "NodeTransform|";
        }

        /**
        *   Parses a transformation element.
        */
        static parse(node: Node, parent: Loader.VisualSceneNode, context: Loader.LoaderContext): Loader.NodeTransform {
            var result: Loader.NodeTransform = new Loader.NodeTransform();

            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.type = node.nodeName;

            context.registerSidTarget(result, parent);
            result.data = context.getFloatsContent(node);

            var expectedDataLength: number = 0;
            switch (result.type) {
                case "matrix":
                    expectedDataLength = 16;
                    break;
                case "rotate":
                    expectedDataLength = 4;
                    break;
                case "translate":
                    expectedDataLength = 3;
                    break;
                case "scale":
                    expectedDataLength = 3;
                    break;
                case "skew":
                    expectedDataLength = 7;
                    break;
                case "lookat":
                    expectedDataLength = 9;
                    break;
                default:
                    context.log.write("Unknown transformation type " + result.type + ".", LogLevel.Error);
            }

            if (result.data.length !== expectedDataLength) {
                context.log.write("Wrong number of elements for transformation type '" + result.type + "': expected " +
                    expectedDataLength + ", found " + result.data.length, LogLevel.Error);
            }

            return result;
        }
    }
