/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="utils.ts" />


module COLLADA.Loader {

    /**
    *   A <scene> element.
    */
    export class Scene extends COLLADA.Loader.Element {
        instance: Link | undefined = undefined;

        constructor() {
            super();
            this._className += "Scene|";
        }

        static parse(node: Node, context: COLLADA.Loader.Context): COLLADA.Loader.Scene {
            var result: COLLADA.Loader.Scene = new COLLADA.Loader.Scene();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "instance_visual_scene":
                        result.instance = context.getAttributeAsUrlLink(child, "url", true);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                        break;
                }
            });

            return result;
        }
    };
}