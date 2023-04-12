/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="utils.ts" />

module COLLADA.Loader {

    export class ColorOrTexture extends COLLADA.Loader.EElement {
        color: Float32Array | undefined;
        textureSampler: Link | undefined;
        texcoord: string = "";
        opaque: string = "";
        bumptype: string = "";

        constructor() {
            super();
            this._className += "ColorOrTexture|";
        }

        /**
        *   Parses a color or texture element  (<ambient>, <diffuse>, ...).
        */
        static parse(node: Node, parent: COLLADA.Loader.EElement, context: COLLADA.Loader.Context): COLLADA.Loader.ColorOrTexture {
            var result: COLLADA.Loader.ColorOrTexture = new COLLADA.Loader.ColorOrTexture();

            result.opaque = context.getAttributeAsString(node, "opaque", undefined, false);
            result.bumptype = context.getAttributeAsString(node, "bumptype", undefined, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "color":
                        result.color = context.strToColor(context.getTextContent(child));
                        break;
                    case "texture":
                        result.textureSampler = context.getAttributeAsFxLink(child, "texture", parent, true);
                        result.texcoord = context.getAttributeAsString(child, "texcoord", undefined, true);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    }
}