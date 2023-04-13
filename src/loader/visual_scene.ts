import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    /**
    *   An <visual_scene> element.
    */
    export class VisualScene extends Loader.EElement {
        children: Loader.VisualSceneNode[];

        constructor() {
            super();
            this._className += "VisualScene|";
            this.children = [];
        }

        static fromLink(link: Loader.Link, context: Context): Loader.VisualScene | undefined {
            return Loader.EElement._fromLink<Loader.VisualScene>(link, "VisualScene", context);
        }

        static parse(node: Node, context: Loader.LoaderContext): Loader.VisualScene {
            var result: Loader.VisualScene = new Loader.VisualScene();

            result.id = context.getAttributeAsString(node, "id", "", false);

            context.registerUrlTarget(result, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "node":
                        var childNode: Loader.VisualSceneNode = Loader.VisualSceneNode.parse(child, context);
                        Loader.VisualSceneNode.registerParent(childNode, result, context);
                        result.children.push(childNode);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                        break;
                }
            });

            return result;
        }
    };

    export class VisualSceneLibrary extends Loader.EElement {
        children: VisualScene[] = [];

        static parse(node: Node, context: Loader.LoaderContext): VisualSceneLibrary {
            var result: VisualSceneLibrary = new VisualSceneLibrary();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "visual_scene":
                        result.children.push(VisualScene.parse(child, context));
                        break;
                    case "extra":
                        context.reportUnhandledChild(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                        break;
                }
            });

            return result;
        }
    }
