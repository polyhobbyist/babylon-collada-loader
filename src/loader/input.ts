import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"


    export class Input extends Loader.EElement {
        /** "VERTEX", "POSITION", "NORMAL", "TEXCOORD", ... */
        semantic: string = "";
        /** URL of source object */
        source: Loader.UrlLink | undefined;
        /** Offset in index array */
        offset: number = 0;
        /** Optional set identifier */
        set: number = 0;

        constructor() {
            super();
            this._className += "Input|";
        }

        /**
        *   Parses an <input> element.
        */
        static parse(node: Node, shared: boolean, context: Loader.Context): Loader.Input {
            var result: Loader.Input = new Loader.Input();

            result.semantic = context.getAttributeAsString(node, "semantic", undefined, true);
            result.source = context.getAttributeAsUrlLink(node, "source", true);

            if (shared) {
                result.offset = context.getAttributeAsInt(node, "offset", 0, true);
                result.set = context.getAttributeAsInt(node, "set", 0, false);
            }

            return result;
        }
    }
