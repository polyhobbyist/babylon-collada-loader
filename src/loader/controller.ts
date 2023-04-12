/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="skin.ts" />
/// <reference path="morph.ts" />
/// <reference path="utils.ts" />

module COLLADA.Loader {

    export class Controller extends COLLADA.Loader.Element {
        skin: COLLADA.Loader.Skin | undefined;
        morph: COLLADA.Loader.Morph | undefined;

        constructor() {
            super();
            this._className += "Controller|";
        }

        static fromLink(link: Link, context: COLLADA.Context): COLLADA.Loader.Controller | undefined {
            return COLLADA.Loader.Element._fromLink<COLLADA.Loader.Controller>(link, "Controller", context);
        }

        /**
        *   Parses a <controller> element.
        */
        static parse(node: Node, context: COLLADA.Loader.Context): COLLADA.Loader.Controller {
            var result: COLLADA.Loader.Controller = new COLLADA.Loader.Controller();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "skin":
                        if (result.skin != null) {
                            context.log.write("Controller " + result.id + " has multiple skins", LogLevel.Error);
                        }
                        result.skin = COLLADA.Loader.Skin.parse(child, context);
                        break;
                    case "morph":
                        if (result.morph != null) {
                            context.log.write("Controller " + result.id + " has multiple morphs", LogLevel.Error);
                        }
                        result.morph = COLLADA.Loader.Morph.parse(child, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
}