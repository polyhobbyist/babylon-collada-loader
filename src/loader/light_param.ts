import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class LightParam extends Loader.EElement {
        value: number| undefined;

        constructor() {
            super();
            this._className += "LightParam|";
        }

        /**
        *   Parses a light parameter element.
        */
        static parse(node: Node, context: Loader.Context): Loader.LightParam {
            var result: Loader.LightParam = new Loader.LightParam();

            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = node.nodeName;
            result.value = context.getFloatContent(node);

            return result;
        }

    }
