import * as Loader from "../loader/loader"
import * as Utils from "./utils"

    export class Camera extends Loader.EElement {
        type: string = "";
        params: { [s: string]: Loader.CameraParam; }

        constructor() {
            super();
            this._className += "Camera|";
            this.params = {};
        }

        /**
        *   Parses a <camera> element.
        */
        static parse(node: Node, context: Loader.Context): Loader.Camera {
            var result: Loader.Camera = new Loader.Camera();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerUrlTarget(result, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "asset":
                        context.reportUnhandledChild(child);
                        break;
                    case "optics":
                        Loader.Camera.parseOptics(child, result, context);
                        break;
                    case "imager":
                        context.reportUnhandledChild(child);
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

        /**
        *   Parses a <camera>/<optics> element.
        */
        static parseOptics(node: Node, camera: Loader.Camera, context: Loader.Context) {

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "technique_common":
                        Loader.Camera.parseTechniqueCommon(child, camera, context);
                        break;
                    case "technique":
                        context.reportUnhandledChild(child);
                        break;
                    case "extra":
                        context.reportUnhandledChild(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

        }

        /**
        *   Parses a <camera>/<optics>/<technique_common> element.
        */
        static parseTechniqueCommon(node: Node, camera: Loader.Camera, context: Loader.Context) {

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "orthographic":
                        Loader.Camera.parseParams(child, camera, context);
                        break;
                    case "perspective":
                        Loader.Camera.parseParams(child, camera, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

        }

        /**
        *   Parses a <camera>/<optics>/<technique_common>/(<orthographic>|<perspective>) element.
        */
        static parseParams(node: Node, camera: Loader.Camera, context: Loader.Context) {

            camera.type = node.nodeName;

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "xmag":
                    case "ymag":
                    case "xfov":
                    case "yfov":
                    case "aspect_ratio":
                    case "znear":
                    case "zfar":
                        var param: Loader.CameraParam = Loader.CameraParam.parse(child, context);
                        context.registerSidTarget(param, camera);
                        camera.params[param.name] = param;
                        break;
                    case "extra":
                        context.reportUnhandledChild(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

        }
    }
