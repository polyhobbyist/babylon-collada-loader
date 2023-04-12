import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class InstanceGeometry extends Loader.EElement {
        geometry: Loader.Link | undefined;
        materials: Loader.InstanceMaterial[];

        constructor() {
            super();
            this._className += "InstanceGeometry|";
            this.materials = [];
        }

        /**
        *   Parses a <instance_geometry> element.
        */
        static parse(node: Node, parent: Loader.EElement, context: Loader.Context): Loader.InstanceGeometry {
            var result: Loader.InstanceGeometry = new Loader.InstanceGeometry();

            result.geometry = context.getAttributeAsUrlLink(node, "url", true);
            result.sid = context.getAttributeAsString(node, "sid", undefined, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
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
