import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class InstanceLight extends Loader.EElement {
        light: Loader.Link | undefined;

        constructor() {
            super();
            this._className += "InstanceLight|";
        }

        /**
        *   Parses a <instance_light> element.
        */
        static parse(node: Node, parent: Loader.VisualSceneNode, context: Loader.Context): Loader.InstanceLight {
            var result: Loader.InstanceLight = new Loader.InstanceLight();

            result.light = context.getAttributeAsUrlLink(node, "url", true);
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
