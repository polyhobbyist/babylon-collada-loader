import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"



    export class Document {
        scene: Loader.Scene | undefined;
        asset: Loader.Asset | undefined;
        libEffects: Loader.Library<Loader.Effect>;
        libMaterials: Loader.Library<Loader.Material>;
        libGeometries: Loader.Library<Loader.Geometry>;
        libControllers: Loader.Library<Loader.Controller>;
        libLights: Loader.Library<Loader.Light>;
        libCameras: Loader.Library<Loader.Camera>;
        libImages: Loader.Library<Loader.Image>;
        libVisualScenes: Loader.Library<Loader.VisualScene>;
        libAnimations: Loader.Library<Loader.Animation>;
        libNodes: Loader.Library<Loader.VisualSceneNode>;

        constructor() {
            this.libEffects = new Loader.Library<Loader.Effect>();
            this.libMaterials = new Loader.Library<Loader.Material>();
            this.libGeometries = new Loader.Library<Loader.Geometry>();
            this.libControllers = new Loader.Library<Loader.Controller>();
            this.libLights = new Loader.Library<Loader.Light>();
            this.libCameras = new Loader.Library<Loader.Camera>();
            this.libImages = new Loader.Library<Loader.Image>();
            this.libVisualScenes = new Loader.Library<Loader.VisualScene>();
            this.libAnimations = new Loader.Library<Loader.Animation>();
            this.libNodes = new Loader.Library<Loader.VisualSceneNode>();
        }

        static parse(doc: XMLDocument, context: Loader.Context): Loader.Document {

            // There should be one top level <COLLADA> element
            var colladaNodes = doc.getElementsByTagName("COLLADA");
            if (colladaNodes.length === 0) {
                context.log?.write("Cannot parse document, no top level COLLADA element.", LogLevel.Error);
                return new Loader.Document();
            } else if (colladaNodes.length > 1) {
                context.log?.write("Cannot parse document, more than one top level COLLADA element.", LogLevel.Error);
                return new Loader.Document();
            }

            return Loader.Document.parseCOLLADA(colladaNodes[0] || colladaNodes.item(0), context);
        }

        static parseCOLLADA(node: Node, context: Loader.Context): Loader.Document {
            var result: Loader.Document = new Loader.Document();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "asset":
                        result.asset = Loader.Asset.parse(child, context);
                        break;
                    case "scene":
                        result.scene = Loader.Scene.parse(child, context);
                        break;
                    case "library_effects":
                        result.libEffects = Loader.Library.parse<Loader.Effect>(child, Loader.Effect.parse, "effect", context);
                        break;
                    case "library_materials":
                        result.libMaterials = Loader.Library.parse<Loader.Material>(child, Loader.Material.parse, "material", context);
                        break;
                    case "library_geometries":
                        result.libGeometries = Loader.Library.parse<Loader.Geometry>(child, Loader.Geometry.parse, "geometry", context);
                        break;
                    case "library_images":
                        result.libImages = Loader.Library.parse<Loader.Image>(child, Loader.Image.parse, "image", context);
                        break;
                    case "library_visual_scenes":
                        result.libVisualScenes = Loader.Library.parse<Loader.VisualScene>(child, Loader.VisualScene.parse, "visual_scene", context);
                        break;
                    case "library_controllers":
                        result.libControllers = Loader.Library.parse<Loader.Controller>(child, Loader.Controller.parse, "controller", context);
                        break;
                    case "library_animations":
                        result.libAnimations = Loader.Library.parse<Loader.Animation>(child, Loader.Animation.parse, "animation", context);
                        break;
                    case "library_lights":
                        result.libLights = Loader.Library.parse<Loader.Light>(child, Loader.Light.parse, "effect", context);
                        break;
                    case "library_cameras":
                        result.libCameras = Loader.Library.parse<Loader.Camera>(child, Loader.Camera.parse, "camera", context);
                        break;
                    case "library_nodes":
                        result.libNodes = Loader.Library.parse<Loader.VisualSceneNode>(child, Loader.VisualSceneNode.parse, "node", context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    };
