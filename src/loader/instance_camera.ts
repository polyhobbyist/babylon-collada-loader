import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"


    export class InstanceCamera extends Loader.EElement {
        camera: Loader.Link | undefined;

        constructor() {
            super();
            this._className += "InstanceCamera|";
        }

        /**
        *   Parses a <instance_light> element.
        */
        static parse(node: Node, parent: Loader.VisualSceneNode, context: Loader.Context): Loader.InstanceCamera {
            var result: Loader.InstanceCamera = new Loader.InstanceCamera();

            result.camera = context.getAttributeAsUrlLink(node, "url", true);
            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerSidTarget(result, parent);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "extra":
                        context.reportUnhandledChild(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    };
