import {Log, LogLevel} from "../log"
import * as Loader from "../loader/loader"
import * as Converter from "./converter"
import * as Utils from "./utils"
import * as MathUtils from "../math"
import {Texture} from "./texture"
import {AnimationTarget} from "./animation"
import * as COLLADAContext from "../context"
import {Options} from "./options"
import {BoundingBox} from "./bounding_box"

    export class MaterialMap {
        symbols: { [symbol: string]: Converter.Material };

        constructor() {
            this.symbols = {};
        }
    }

    export class Material {
        name: string;
        diffuse: Converter.Texture;
        specular: Converter.Texture;
        normal: Converter.Texture;

        constructor() {
            this.name = null;
            this.diffuse = null;
            this.specular = null;
            this.normal = null;
        }

        static createDefaultMaterial(context: Converter.ConverterContext): Converter.Material {
            var result: Converter.Material = context.materials.findConverter(null);
            if (result) {
                return result;
            } else {
                result = new Converter.Material();
                context.materials.register(undefined, result);
                return result;
            }
        }

        static createMaterial(instanceMaterial: Loader.InstanceMaterial, context: Converter.ConverterContext): Converter.Material {

            var material: Loader.Material = Loader.Material.fromLink(instanceMaterial.material, context);
            if (!material) {
                context.log.write("Material not found, material skipped.", LogLevel.Warning);
                return Converter.Material.createDefaultMaterial(context);
            }

            var effect: Loader.Effect = Loader.Effect.fromLink(material.effect, context);
            if (!effect) {
                context.log.write("Material effect not found, using default material", LogLevel.Warning);
                return Converter.Material.createDefaultMaterial(context);
            }

            var technique: Loader.EffectTechnique = effect.technique;
            if (!technique) {
                context.log.write("Material effect not found, using default material", LogLevel.Warning);
                return Converter.Material.createDefaultMaterial(context);
            }

            if (technique.diffuse !== null && technique.diffuse.color !== null) {
                context.log.write("Material " + material.id + " contains constant diffuse colors, colors ignored", LogLevel.Warning);
            }

            if (technique.specular !== null && technique.specular.color !== null) {
                context.log.write("Material " + material.id + " contains constant specular colors, colors ignored", LogLevel.Warning);
            }

            var result: Converter.Material = context.materials.findConverter(material);
            if (result) return result;

            result = new Converter.Material();
            result.name = material.id;
            result.diffuse = Converter.Texture.createTexture(technique.diffuse, context);
            result.specular = Converter.Texture.createTexture(technique.specular, context);
            result.normal = Converter.Texture.createTexture(technique.bump, context);
            context.materials.register(material, result);

            return result;
        }

        static getMaterialMap(instanceMaterials: Loader.InstanceMaterial[], context: Converter.ConverterContext): Converter.MaterialMap {
            var result: Converter.MaterialMap = new Converter.MaterialMap();

            var numMaterials: number = 0;
            for (var i: number = 0; i < instanceMaterials.length; i++) {
                var instanceMaterial: Loader.InstanceMaterial = instanceMaterials[i];

                var symbol: string = instanceMaterial.symbol;
                if (!symbol) {
                    context.log.write("Material instance has no symbol, material skipped.", LogLevel.Warning);
                    continue;
                }

                if (result.symbols[symbol] != null) {
                    context.log.write("Material symbol " + symbol + " used multiple times", LogLevel.Error);
                    continue;
                }

                result.symbols[symbol] = Converter.Material.createMaterial(instanceMaterial, context);
            }
            return result;
        }
    }
