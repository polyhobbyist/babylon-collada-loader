import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class Morph extends Loader.EElement {

        constructor() {
            super();
            this._className += "Morph|";
        }

        /**
        *   Parses a <morph> element.
        */
        static parse(node: Node, context: Loader.Context): Loader.Morph {
            var result: Loader.Morph = new Loader.Morph();

            context.log.write("Morph controllers not implemented", LogLevel.Error);

            return result;
        }

    }
