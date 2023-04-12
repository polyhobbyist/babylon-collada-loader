/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="instance_camera.ts" />
/// <reference path="instance_controller.ts" />
/// <reference path="instance_geometry.ts" />
/// <reference path="instance_light.ts" />
/// <reference path="node_transform.ts" />
/// <reference path="utils.ts" />


module COLLADA.Loader {

    /**
    *   A <node> element (child of <visual_scene>, <library_nodes>, or another <node>).
    */
    export class VisualSceneNode extends COLLADA.Loader.EElement {
        type: string;
        layer: string;
        children: COLLADA.Loader.VisualSceneNode[];
        parent: COLLADA.Loader.EElement | undefined;
        transformations: COLLADA.Loader.NodeTransform[];
        geometries: COLLADA.Loader.InstanceGeometry[];
        controllers: COLLADA.Loader.InstanceController[];
        lights: COLLADA.Loader.InstanceLight[];
        cameras: COLLADA.Loader.InstanceCamera[];

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

        static fromLink(link: Link, context: COLLADA.Context): COLLADA.Loader.VisualSceneNode | undefined {
            return COLLADA.Loader.EElement._fromLink<COLLADA.Loader.VisualSceneNode>(link, "VisualSceneNode", context);
        }

        static registerParent(child: COLLADA.Loader.VisualSceneNode, parent: COLLADA.Loader.EElement, context: COLLADA.Loader.Context) {
            child.parent = parent;
            context.registerSidTarget(child, parent);
        }

        static parse(node: Node, context: COLLADA.Loader.Context): COLLADA.Loader.VisualSceneNode {
            var result: COLLADA.Loader.VisualSceneNode = new COLLADA.Loader.VisualSceneNode();

            result.id = context.getAttributeAsString(node, "id", undefined, false);
            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            result.type = context.getAttributeAsString(node, "type", undefined, false);
            result.layer = context.getAttributeAsString(node, "layer", undefined, false);

            context.registerUrlTarget(result, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "instance_geometry":
                        result.geometries.push(COLLADA.Loader.InstanceGeometry.parse(child, result, context));
                        break;
                    case "instance_controller":
                        result.controllers.push(COLLADA.Loader.InstanceController.parse(child, result, context));
                        break;
                    case "instance_light":
                        result.lights.push(COLLADA.Loader.InstanceLight.parse(child, result, context));
                        break;
                    case "instance_camera":
                        result.cameras.push(COLLADA.Loader.InstanceCamera.parse(child, result, context));
                        break;
                    case "matrix":
                    case "rotate":
                    case "translate":
                    case "scale":
                        result.transformations.push(COLLADA.Loader.NodeTransform.parse(child, result, context));
                        break;
                    case "node":
                        var childNode: COLLADA.Loader.VisualSceneNode = COLLADA.Loader.VisualSceneNode.parse(child, context);
                        COLLADA.Loader.VisualSceneNode.registerParent(childNode, result, context);
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
}