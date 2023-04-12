import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    /**
    *   An <effect> element.
    *
    */
    export class Effect extends Loader.EElement {
        params: Loader.EffectParam[];
        technique: Loader.EffectTechnique | undefined;

        constructor() {
            super();
            this._className += "Effect|";
            this.params = [];
        }

        static fromLink(link: Loader.Link, context: Context): Loader.Effect | undefined{
            return Loader.EElement._fromLink<Loader.Effect>(link, "Effect", context);
        }

        /**
        *   Parses an <effect> element.
        */
        static parse(node: Node, context: Loader.Context): Loader.Effect {
            var result: Loader.Effect = new Loader.Effect();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "profile_COMMON":
                        Loader.Effect.parseProfileCommon(child, result, context);
                        break;
                    case "profile":
                        context.log.write("Skipped non-common effect profile for effect " + result.id + ".", LogLevel.Warning);
                        break;
                    case "extra":
                        if (result.technique) {
                            Loader.EffectTechnique.parseExtra(child, result.technique, context);
                        }
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

        /**
        *   Parses an <effect>/<profile_COMMON> element.
        */
        static parseProfileCommon(node: Node, effect: Loader.Effect, context: Loader.Context) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "newparam":
                        effect.params.push(Loader.EffectParam.parse(child, effect, context));
                        break;
                    case "technique":
                        effect.technique = Loader.EffectTechnique.parse(child, effect, context);
                        break;
                    case "extra":
                        if (effect.technique) {
                            Loader.EffectTechnique.parseExtra(child, effect.technique, context);
                        }
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }
    };
