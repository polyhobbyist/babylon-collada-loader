/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="utils.ts" />


module COLLADA.Loader {

    /**
    *   A <surface> element.
    *
    */
    export class EffectSurface extends COLLADA.Loader.EElement {
        type: string = "";
        initFrom: Link | undefined;
        format: string = "";
        size: Float32Array = new Float32Array();
        viewportRatio: Float32Array = new Float32Array();
        mipLevels: number = 0;
        mipmapGenerate: boolean = false;

        constructor() {
            super();
            this._className += "EffectSurface|";
        }

        static fromLink(link: Link, context: COLLADA.Context): COLLADA.Loader.EffectSurface | undefined{
            return COLLADA.Loader.EElement._fromLink<COLLADA.Loader.EffectSurface>(link, "EffectSurface", context);
        }

        /**
        *   Parses a <surface> element.
        */
        static parse(node: Node, parent: COLLADA.Loader.EElement, context: COLLADA.Loader.Context): COLLADA.Loader.EffectSurface {
            var result: COLLADA.Loader.EffectSurface = new COLLADA.Loader.EffectSurface();

            result.type = context.getAttributeAsString(node, "type", undefined, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "init_from":
                        result.initFrom = context.createUrlLink(context.getTextContent(child));
                        break;
                    case "format":
                        result.format = context.getTextContent(child);
                        break;
                    case "size":
                        result.size = context.getFloatsContent(child);
                        break;
                    case "viewport_ratio":
                        result.viewportRatio = context.getFloatsContent(child);
                        break;
                    case "mip_levels":
                        result.mipLevels = context.getIntContent(child);
                        break;
                    case "mipmap_generate":
                        result.mipmapGenerate = (context.getTextContent(child).toLowerCase() === "true");
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    }
}