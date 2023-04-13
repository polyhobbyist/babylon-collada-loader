import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"


    /**
    *   A <node> element (child of <visual_scene>, <library_nodes>, or another <node>).
    */
    export class VisualSceneNode extends Loader.EElement {
        type: string;
        layer: string;
        children: Loader.VisualSceneNode[];
        parent: Loader.EElement | undefined;
        transformations: Loader.NodeTransform[];
        geometries: Loader.InstanceGeometry[];
        controllers: Loader.InstanceController[];
        lights: Loader.InstanceLight[];
        cameras: Loader.InstanceCamera[];

        constructor() {
            super();
            this._className += "VisualSceneNode|";
            this.type = "";
            this.layer = "";
            this.children = [];
            this.parent = undefined;
            this.transformations = [];
            this.geometries = [];
            this.controllers = [];
            this.lights = [];
            this.cameras = [];
        }

        static fromLink(link: Loader.Link, context: Context): Loader.VisualSceneNode | undefined {
            return Loader.EElement._fromLink<Loader.VisualSceneNode>(link, "VisualSceneNode", context);
        }

        static registerParent(child: Loader.VisualSceneNode, parent: Loader.EElement, context: Loader.LoaderContext) {
            child.parent = parent;
            context.registerSidTarget(child, parent);
        }

        static parse(node: Node, context: Loader.LoaderContext): Loader.VisualSceneNode {
            var result: Loader.VisualSceneNode = new Loader.VisualSceneNode();

            result.id = context.getAttributeAsString(node, "id", undefined, false);
            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            result.type = context.getAttributeAsString(node, "type", undefined, false);
            result.layer = context.getAttributeAsString(node, "layer", undefined, false);

            context.registerUrlTarget(result, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "instance_geometry":
                        result.geometries.push(Loader.InstanceGeometry.parse(child, result, context));
                        break;
                    case "instance_controller":
                        result.controllers.push(Loader.InstanceController.parse(child, result, context));
                        break;
                    case "instance_light":
                        result.lights.push(Loader.InstanceLight.parse(child, result, context));
                        break;
                    case "instance_camera":
                        result.cameras.push(Loader.InstanceCamera.parse(child, result, context));
                        break;
                    case "matrix":
                    case "rotate":
                    case "translate":
                    case "scale":
                        result.transformations.push(Loader.NodeTransform.parse(child, result, context));
                        break;
                    case "node":
                        var childNode: Loader.VisualSceneNode = Loader.VisualSceneNode.parse(child, context);
                        Loader.VisualSceneNode.registerParent(childNode, result, context);
                        result.children.push(childNode);
                        break;
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


    export class VisualSceneNodeLibrary extends Loader.EElement {
        children: VisualSceneNode[] = [];

        static parse(node: Node, context: Loader.LoaderContext): VisualSceneNodeLibrary {
            var result: VisualSceneNodeLibrary = new VisualSceneNodeLibrary();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "node":
                        result.children.push(VisualSceneNode.parse(child, context));
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
