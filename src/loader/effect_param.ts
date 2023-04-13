import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"


    /**
    *   An <newparam> element.
    *
    */
    export class EffectParam extends Loader.EElement {
        semantic: string| undefined;
        surface: Loader.EffectSurface| undefined;
        sampler: Loader.EffectSampler| undefined;
        floats: Float32Array| undefined;

        constructor() {
            super();
            this._className += "EffectParam|";
        }

        static fromLink(link: Loader.Link, context: Context): Loader.EffectParam | undefined {
            return Loader.EElement._fromLink<Loader.EffectParam>(link, "EffectParam", context);
        }

        /**
        *   Parses a <newparam> element.
        */
        static parse(node: Node, parent: Loader.EElement, context: Loader.LoaderContext): Loader.EffectParam {
            var result: Loader.EffectParam = new Loader.EffectParam();

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
                        result.surface = Loader.EffectSurface.parse(child, result, context);
                        break;
                    case "sampler2D":
                        result.sampler = Loader.EffectSampler.parse(child, result, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    }
