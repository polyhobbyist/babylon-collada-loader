import * as Loader from "./loader"
import * as Utils from "./utils"

    export class ColorOrTexture extends Loader.EElement {
        color: Float32Array | undefined;
        textureSampler: Loader.Link | undefined;
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
        static parse(node: Node, parent: Loader.EElement, context: Loader.Context): Loader.ColorOrTexture {
            var result: Loader.ColorOrTexture = new Loader.ColorOrTexture();

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
