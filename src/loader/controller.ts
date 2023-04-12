import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"



    export class Controller extends Loader.EElement {
        skin: Loader.Skin | undefined;
        morph: Loader.Morph | undefined;

        constructor() {
            super();
            this._className += "Controller|";
        }

        static fromLink(link: Loader.Link, context: Context): Loader.Controller | undefined {
            return Loader.EElement._fromLink<Loader.Controller>(link, "Controller", context);
        }

        /**
        *   Parses a <controller> element.
        */
        static parse(node: Node, context: Loader.Context): Loader.Controller {
            var result: Loader.Controller = new Loader.Controller();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "skin":
                        if (result.skin != null) {
                            context.log.write("Controller " + result.id + " has multiple skins", LogLevel.Error);
                        }
                        result.skin = Loader.Skin.parse(child, context);
                        break;
                    case "morph":
                        if (result.morph != null) {
                            context.log.write("Controller " + result.id + " has multiple morphs", LogLevel.Error);
                        }
                        result.morph = Loader.Morph.parse(child, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
