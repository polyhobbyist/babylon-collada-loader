/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="effect_param.ts" />
/// <reference path="effect_technique.ts" />
/// <reference path="utils.ts" />


module COLLADA.Loader {

    /**
    *   An <effect> element.
    *
    */
    export class Effect extends COLLADA.Loader.EElement {
        params: COLLADA.Loader.EffectParam[];
        technique: COLLADA.Loader.EffectTechnique | undefined;

        constructor() {
            super();
            this._className += "Effect|";
            this.params = [];
        }

        static fromLink(link: Link, context: COLLADA.Context): COLLADA.Loader.Effect | undefined{
            return COLLADA.Loader.EElement._fromLink<COLLADA.Loader.Effect>(link, "Effect", context);
        }

        /**
        *   Parses an <effect> element.
        */
        static parse(node: Node, context: COLLADA.Loader.Context): COLLADA.Loader.Effect {
            var result: COLLADA.Loader.Effect = new COLLADA.Loader.Effect();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "profile_COMMON":
                        COLLADA.Loader.Effect.parseProfileCommon(child, result, context);
                        break;
                    case "profile":
                        context.log.write("Skipped non-common effect profile for effect " + result.id + ".", LogLevel.Warning);
                        break;
                    case "extra":
                        if (result.technique) {
                            COLLADA.Loader.EffectTechnique.parseExtra(child, result.technique, context);
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
        static parseProfileCommon(node: Node, effect: COLLADA.Loader.Effect, context: COLLADA.Loader.Context) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "newparam":
                        effect.params.push(COLLADA.Loader.EffectParam.parse(child, effect, context));
                        break;
                    case "technique":
                        effect.technique = COLLADA.Loader.EffectTechnique.parse(child, effect, context);
                        break;
                    case "extra":
                        if (effect.technique) {
                            COLLADA.Loader.EffectTechnique.parseExtra(child, effect.technique, context);
                        }
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }
    };
}