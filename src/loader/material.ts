import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class Material extends Loader.EElement {
        effect: Loader.Link | undefined;

        constructor() {
            super();
            this._className += "Material|";
        }

        static fromLink(link: Loader.Link, context: Context): Material | undefined {
            return Loader.EElement._fromLink<Material>(link, "Material", context);
        }

        /**
        *   Parses a <material> element.
        */
        static parse(node: Node, context: Loader.LoaderContext): Material {
            var result: Material = new Material();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "instance_effect":
                        result.effect = context.getAttributeAsUrlLink(child, "url", true);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    };

    
export class MaterialLibrary extends Loader.EElement {
    children: Material[] = [];

    static parse(node: Node, context: Loader.LoaderContext): MaterialLibrary {
        var result: MaterialLibrary = new MaterialLibrary();

        Utils.forEachChild(node, function (child: Node) {
            switch (child.nodeName) {
                case "material":
                    result.children.push(Material.parse(child, context));
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
