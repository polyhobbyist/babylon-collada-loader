import {Log, LogLevel} from "../log"
import * as Loader from "../loader/loader"
import * as Converter from "./converter"
import * as Utils from "./utils"
import * as MathUtils from "../math"
import {Material} from "./material"
import {Texture} from "./texture"
import {AnimationTarget} from "./animation"
import * as COLLADAContext from "../context"
import {Options} from "./options"

/**
    * A map that maps various COLLADA objects to converter objects
    * 
    * The converter does not store direct references to COLLADA objects,
    * so that the old COLLADA document can be garbage collected.
    */
    export class ObjectMap<ColladaType, ConverterType> {
        collada: ColladaType[];
        converter: ConverterType[];

        constructor() {
            this.collada = [];
            this.converter = [];
        }

        register(collada: ColladaType, converter: ConverterType) {
            this.collada.push(collada);
            this.converter.push(converter);
        }

        findConverter(collada: ColladaType): ConverterType {
            for (var i: number = 0; i < this.collada.length; ++i) {
                if (this.collada[i] === collada) return this.converter[i];
            }
            return null;
        }

        findCollada(converter: ConverterType): ColladaType {
            for (var i: number = 0; i < this.collada.length; ++i) {
                if (this.converter[i] === converter) return this.collada[i];
            }
            return null;
        }
    }

    export class Context extends COLLADAContext.Context {
        materials: ObjectMap<Loader.Material, Material>;
        textures: ObjectMap<Loader.Image, Texture>;
        nodes: ObjectMap<Loader.VisualSceneNode, Converter.Node>;
        animationTargets: ObjectMap<Loader.EElement, AnimationTarget>;
        log: Log;
        options: Options;
        messageCount: { [name: string]: number };

        constructor(log: Log, options: Options) {
            super(log);
            this.log = log;
            this.options = options;
            this.materials = new ObjectMap<Loader.Material, Material>();
            this.textures = new ObjectMap<Loader.Image, Texture>();
            this.nodes = new ObjectMap<Loader.VisualSceneNode, Converter.Node>();
            this.animationTargets = new ObjectMap<Loader.EElement, AnimationTarget>();
            this.messageCount = {};
        }
    }