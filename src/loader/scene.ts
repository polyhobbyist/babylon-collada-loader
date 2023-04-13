import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    /**
    *   A <scene> element.
    */
    export class Scene extends Loader.EElement {
        instance: Loader.Link | undefined = undefined;

        constructor() {
            super();
            this._className += "Scene|";
        }

        static parse(node: Node, context: Loader.LoaderContext): Loader.Scene {
            var result: Loader.Scene = new Loader.Scene();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "instance_visual_scene":
                        result.instance = context.getAttributeAsUrlLink(child, "url", true);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                        break;
                }
            });

            return result;
        }
    };
