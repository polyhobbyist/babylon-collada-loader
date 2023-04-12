import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"



    /**
    *   A <surface> element.
    *
    */
    export class EffectSurface extends Loader.EElement {
        type: string = "";
        initFrom: Loader.Link | undefined;
        format: string = "";
        size: Float32Array = new Float32Array();
        viewportRatio: Float32Array = new Float32Array();
        mipLevels: number = 0;
        mipmapGenerate: boolean = false;

        constructor() {
            super();
            this._className += "EffectSurface|";
        }

        static fromLink(link: Loader.Link, context: Context): Loader.EffectSurface | undefined{
            return Loader.EElement._fromLink<Loader.EffectSurface>(link, "EffectSurface", context);
        }

        /**
        *   Parses a <surface> element.
        */
        static parse(node: Node, parent: Loader.EElement, context: Loader.Context): Loader.EffectSurface {
            var result: Loader.EffectSurface = new Loader.EffectSurface();

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
