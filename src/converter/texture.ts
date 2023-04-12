import {Log, LogLevel} from "../log"
import * as Loader from "../loader/loader"
import * as Converter from "./converter"
import * as Utils from "./utils"
import * as MathUtils from "../math"
import {Bone} from "./bone"
import {AnimationTarget} from "./animation"
import * as COLLADAContext from "../context"
import {Options} from "./options"
import {BoundingBox} from "./bounding_box"

export class Texture {
        id: string;
        url: string;

        constructor(img: Loader.Image) {
            this.id = img.id;
            this.url = "";
        }

        static createTexture(colorOrTexture: Loader.ColorOrTexture, context: Converter.Context): Converter.Texture {
            if (colorOrTexture === null) {
                return null;
            }
            if (colorOrTexture.textureSampler === null) {
                return null;
            }
            var textureSamplerParam: Loader.EffectParam = Loader.EffectParam.fromLink(colorOrTexture.textureSampler, context);
            if (textureSamplerParam === null) {
                context.log.write("Texture sampler not found, texture will be missing", LogLevel.Warning);
                return null;
            }
            var textureSampler: Loader.EffectSampler = textureSamplerParam.sampler;
            if (textureSampler === null) {
                context.log.write("Texture sampler param has no sampler, texture will be missing", LogLevel.Warning);
                return null;
            }
            var textureImage: Loader.Image = null;
            if (textureSampler.image != null) {
                // Collada 1.5 path: texture -> sampler -> image
                textureImage = Loader.Image.fromLink(textureSampler.image, context);
                if (textureImage === null) {
                    context.log.write("Texture image not found, texture will be missing", LogLevel.Warning);
                    return null;
                }
            } else if (textureSampler.surface != null) {
                // Collada 1.4 path: texture -> sampler -> surface -> image
                var textureSurfaceParam: Loader.EffectParam = Loader.EffectParam.fromLink(textureSampler.surface, context);
                if (textureSurfaceParam === null) {
                    context.log.write("Texture surface not found, texture will be missing", LogLevel.Warning);
                    return null;
                }
                var textureSurface: Loader.EffectSurface = textureSurfaceParam.surface;
                if (textureSurface === null) {
                    context.log.write("Texture surface param has no surface, texture will be missing", LogLevel.Warning);
                    return null;
                }
                textureImage = Loader.Image.fromLink(textureSurface.initFrom, context);
                if (textureImage === null) {
                    context.log.write("Texture image not found, texture will be missing", LogLevel.Warning);
                    return null;
                }
            }

            var result: Converter.Texture = context.textures.findConverter(textureImage);
            if (result) return result;

            result = new Converter.Texture(textureImage);
            result.url = textureImage.initFrom;
            if (context.options.removeTexturePath.value === true) {
                result.url = result.url.replace(/^.*[\\\/]/, '');
            }
            context.textures.register(textureImage, result);

            return result;
        }
    }
