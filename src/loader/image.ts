/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="utils.ts" />

module COLLADA.Loader {

    export class Image extends COLLADA.Loader.Element {
        initFrom: string | undefined;

        constructor() {
            super();
            this._className += "Image|";
        }

        static fromLink(link: Link, context: COLLADA.Context): COLLADA.Loader.Image  | undefined{
            return COLLADA.Loader.Element._fromLink<COLLADA.Loader.Image>(link, "Image", context);
        }

        /**
        *   Parses an <image> element.
        */
        static parse(node: Node, context: COLLADA.Loader.Context): COLLADA.Loader.Image {
            var result: COLLADA.Loader.Image = new COLLADA.Loader.Image();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "init_from":
                        result.initFrom = context.getTextContent(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
}