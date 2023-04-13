import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export interface InstanceControllerContainer extends Loader.EElement {
        controllers: Loader.InstanceController[];
    }

    export class InstanceController extends Loader.EElement {
        controller: Loader.Link | undefined;
        skeletons: Loader.Link[];
        materials: Loader.InstanceMaterial[];

        constructor() {
            super();
            this._className += "InstanceController|";
            this.skeletons = [];
            this.materials = [];
        }

        /**
        *   Parses a <instance_controller> element.
        */
        static parse(node: Node, parent: Loader.InstanceControllerContainer, context: Loader.LoaderContext): Loader.InstanceController {
            var result: Loader.InstanceController = new Loader.InstanceController();

            result.controller = context.getAttributeAsUrlLink(node, "url", true);
            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerSidTarget(result, parent);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "skeleton":
                        result.skeletons.push(context.createUrlLink(context.getTextContent(child)));
                        break;
                    case "bind_material":
                        Loader.BindMaterial.parse(child, result, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    };
