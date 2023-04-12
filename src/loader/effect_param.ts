/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="effect_surface.ts" />
/// <reference path="effect_sampler.ts" />
/// <reference path="utils.ts" />


module COLLADA.Loader {

    /**
    *   An <newparam> element.
    *
    */
    export class EffectParam extends COLLADA.Loader.EElement {
        semantic: string| undefined;
        surface: COLLADA.Loader.EffectSurface| undefined;
        sampler: COLLADA.Loader.EffectSampler| undefined;
        floats: Float32Array| undefined;

        constructor() {
            super();
            this._className += "EffectParam|";
        }

        static fromLink(link: Link, context: COLLADA.Context): COLLADA.Loader.EffectParam | undefined {
            return COLLADA.Loader.EElement._fromLink<COLLADA.Loader.EffectParam>(link, "EffectParam", context);
        }

        /**
        *   Parses a <newparam> element.
        */
        static parse(node: Node, parent: COLLADA.Loader.EElement, context: COLLADA.Loader.Context): COLLADA.Loader.EffectParam {
            var result: COLLADA.Loader.EffectParam = new COLLADA.Loader.EffectParam();

            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            context.registerFxTarget(result, parent);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "semantic":
                        result.semantic = context.getTextContent(child);
                        break;
                    case "float":
                        result.floats = context.getFloatsContent(child);
                        break;
                    case "float2":
                        result.floats = context.getFloatsContent(child);
                        break;
                    case "float3":
                        result.floats = context.getFloatsContent(child);
                        break;
                    case "float4":
                        result.floats = context.getFloatsContent(child);
                        break;
                    case "surface":
                        result.surface = COLLADA.Loader.EffectSurface.parse(child, result, context);
                        break;
                    case "sampler2D":
                        result.sampler = COLLADA.Loader.EffectSampler.parse(child, result, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    }
}