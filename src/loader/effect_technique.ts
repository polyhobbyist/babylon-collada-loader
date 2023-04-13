import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    /**
    *   An <technique> element.
    *
    */
    export class EffectTechnique extends Loader.EElement {
        params: Loader.EffectParam[] | undefined;
        shading: string = "";
        emission: Loader.ColorOrTexture | undefined;
        ambient: Loader.ColorOrTexture | undefined;
        diffuse: Loader.ColorOrTexture | undefined;
        specular: Loader.ColorOrTexture | undefined;
        reflective: Loader.ColorOrTexture | undefined;
        transparent: Loader.ColorOrTexture | undefined;
        bump: Loader.ColorOrTexture | undefined;
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

        static fromLink(link: Loader.Link, context: Context): Loader.EffectTechnique | undefined{
            return Loader.EElement._fromLink<Loader.EffectTechnique>(link, "EffectTechnique", context);
        }

        /**
        *   Parses a <technique> element.
        */
        static parse(node: Node, parent: Loader.EElement, context: Loader.LoaderContext): Loader.EffectTechnique {
            var result: Loader.EffectTechnique = new Loader.EffectTechnique();

            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            context.registerFxTarget(result, parent);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "blinn":
                    case "phong":
                    case "lambert":
                    case "constant":
                        result.shading = child.nodeName;
                        Loader.EffectTechnique.parseParam(child, result, "COMMON", context);
                        break;
                    case "extra":
                        Loader.EffectTechnique.parseExtra(child, result, context);
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
        static parseParam(node: Node, technique: Loader.EffectTechnique, profile: string, context: Loader.LoaderContext) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "newparam":
                        technique.params?.push(Loader.EffectParam.parse(child, technique, context));
                        break;
                    case "emission":
                        technique.emission = Loader.ColorOrTexture.parse(child, technique, context);
                        break;
                    case "ambient":
                        technique.ambient = Loader.ColorOrTexture.parse(child, technique, context);
                        break;
                    case "diffuse":
                        technique.diffuse = Loader.ColorOrTexture.parse(child, technique, context);
                        break;
                    case "specular":
                        technique.specular = Loader.ColorOrTexture.parse(child, technique, context);
                        break;
                    case "reflective":
                        technique.reflective = Loader.ColorOrTexture.parse(child, technique, context);
                        break;
                    case "transparent":
                        technique.transparent = Loader.ColorOrTexture.parse(child, technique, context);
                        break;
                    case "bump":
                        technique.bump = Loader.ColorOrTexture.parse(child, technique, context);
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
        static parseExtra(node: Node, technique: Loader.EffectTechnique, context: Loader.LoaderContext) {
            if (technique == null) {
                context.log.write("Ignored element <extra>, because there is no <technique>.", LogLevel.Warning);
                return;
            }

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "technique":
                        var profile: string = context.getAttributeAsString(child, "profile", undefined, true);
                        Loader.EffectTechnique.parseParam(child, technique, profile, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }
    }
