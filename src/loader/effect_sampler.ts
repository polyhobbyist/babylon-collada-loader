import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    /**
    *   An <newparam> element.
    */
    export class EffectSampler extends Loader.EElement {
        surface: Loader.Link | undefined;
        image: Loader.Link | undefined;
        wrapS: string = "";
        wrapT: string = "";
        minFilter: string = "";
        magFilter: string = "";
        borderColor: Float32Array | undefined;
        mipmapMaxLevel: number = 0;
        mipmapBias: number = 0;

        constructor() {
            super();
            this._className += "EffectSampler|";
        }

        static fromLink(link: Loader.Link, context: Context): Loader.EffectSampler | undefined {
            return Loader.EElement._fromLink<Loader.EffectSampler>(link, "EffectSampler", context);
        }

        /**
        *   Parses a <newparam> element.
        */
        static parse(node: Node, parent: Loader.EElement, context: Loader.Context): Loader.EffectSampler {
            var result: Loader.EffectSampler = new Loader.EffectSampler();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "source":
                        result.surface = context.createFxLink(context.getTextContent(child), parent);
                        break;
                    case "instance_image":
                        result.image = context.getAttributeAsUrlLink(child, "url", true);
                        break;
                    case "wrap_s":
                        result.wrapS = context.getTextContent(child);
                        break;
                    case "wrap_t":
                        result.wrapT = context.getTextContent(child);
                        break;
                    case "minfilter":
                        result.minFilter = context.getTextContent(child);
                        break;
                    case "magfilter":
                        result.magFilter = context.getTextContent(child);
                        break;
                    case "border_color":
                        result.borderColor = context.getFloatsContent(child);
                        break;
                    case "mipmap_maxlevel":
                        result.mipmapMaxLevel = context.getIntContent(child);
                        break;
                    case "mipmap_bias":
                        result.mipmapBias = context.getFloatContent(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    }
