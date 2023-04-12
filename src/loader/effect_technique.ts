/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="color_or_texture.ts" />
/// <reference path="effect_param.ts" />
/// <reference path="utils.ts" />


module COLLADA.Loader {

    /**
    *   An <technique> element.
    *
    */
    export class EffectTechnique extends COLLADA.Loader.Element {
        params: COLLADA.Loader.EffectParam[] | undefined;
        shading: string = "";
        emission: COLLADA.Loader.ColorOrTexture | undefined;
        ambient: COLLADA.Loader.ColorOrTexture | undefined;
        diffuse: COLLADA.Loader.ColorOrTexture | undefined;
        specular: COLLADA.Loader.ColorOrTexture | undefined;
        reflective: COLLADA.Loader.ColorOrTexture | undefined;
        transparent: COLLADA.Loader.ColorOrTexture | undefined;
        bump: COLLADA.Loader.ColorOrTexture | undefined;
        shininess: number = 0;
        transparency: number = 0;
        reflectivity: number = 0;
        index_of_refraction: number = 0;
        double_sided: boolean = false;

        constructor() {
            super();
            this._className += "EffectTechnique|";
            this.params = [];
        }

        static fromLink(link: Link, context: COLLADA.Context): COLLADA.Loader.EffectTechnique | undefined{
            return COLLADA.Loader.Element._fromLink<COLLADA.Loader.EffectTechnique>(link, "EffectTechnique", context);
        }

        /**
        *   Parses a <technique> element.
        */
        static parse(node: Node, parent: COLLADA.Loader.Element, context: COLLADA.Loader.Context): COLLADA.Loader.EffectTechnique {
            var result: COLLADA.Loader.EffectTechnique = new COLLADA.Loader.EffectTechnique();

            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            context.registerFxTarget(result, parent);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "blinn":
                    case "phong":
                    case "lambert":
                    case "constant":
                        result.shading = child.nodeName;
                        COLLADA.Loader.EffectTechnique.parseParam(child, result, "COMMON", context);
                        break;
                    case "extra":
                        COLLADA.Loader.EffectTechnique.parseExtra(child, result, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

        /**
        *   Parses a <technique>/(<blinn>|<phong>|<lambert>|<constant>) element.
        *   In addition to <technique>, node may also be child of <technique>/<extra>
        */
        static parseParam(node: Node, technique: COLLADA.Loader.EffectTechnique, profile: string, context: COLLADA.Loader.Context) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "newparam":
                        technique.params?.push(COLLADA.Loader.EffectParam.parse(child, technique, context));
                        break;
                    case "emission":
                        technique.emission = COLLADA.Loader.ColorOrTexture.parse(child, technique, context);
                        break;
                    case "ambient":
                        technique.ambient = COLLADA.Loader.ColorOrTexture.parse(child, technique, context);
                        break;
                    case "diffuse":
                        technique.diffuse = COLLADA.Loader.ColorOrTexture.parse(child, technique, context);
                        break;
                    case "specular":
                        technique.specular = COLLADA.Loader.ColorOrTexture.parse(child, technique, context);
                        break;
                    case "reflective":
                        technique.reflective = COLLADA.Loader.ColorOrTexture.parse(child, technique, context);
                        break;
                    case "transparent":
                        technique.transparent = COLLADA.Loader.ColorOrTexture.parse(child, technique, context);
                        break;
                    case "bump":
                        technique.bump = COLLADA.Loader.ColorOrTexture.parse(child, technique, context);
                        break;
                    case "shininess":
                        technique.shininess = context.getFloatContent(child.childNodes[1] || child.childNodes.item(0));
                        break;
                    case "reflectivity":
                        technique.reflectivity = context.getFloatContent(child.childNodes[1] || child.childNodes.item(0));
                        break;
                    case "transparency":
                        technique.transparency = context.getFloatContent(child.childNodes[1] || child.childNodes.item(0));
                        break;
                    case "index_of_refraction":
                        technique.index_of_refraction = context.getFloatContent(child.childNodes[1] || child.childNodes.item(0));
                        break;
                    case "double_sided":
                        technique.double_sided = context.getFloatContent(child) > 0;
                        break;
                    default:
                        if (profile === "COMMON") {
                            context.reportUnexpectedChild(child);
                        }
                }
            });
        }

        /**
        *   Parses a <technique>/<extra> element.
        */
        static parseExtra(node: Node, technique: COLLADA.Loader.EffectTechnique, context: COLLADA.Loader.Context) {
            if (technique == null) {
                context.log.write("Ignored element <extra>, because there is no <technique>.", LogLevel.Warning);
                return;
            }

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "technique":
                        var profile: string = context.getAttributeAsString(child, "profile", undefined, true);
                        COLLADA.Loader.EffectTechnique.parseParam(child, technique, profile, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }
    }
}