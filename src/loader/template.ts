import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    /**
    *   A template for a COLLADA element class. No actual use.
    */
    export class ElementTemplate extends Loader.EElement {
        member: any;

        constructor() {
            super();
            this._className += "ElementTemplate|";
            this.member = null;
        }

        /**
        *   Parses a <...> element.
        */
        static parse(node: Node, context: Loader.LoaderContext): Loader.ElementTemplate {
            var result: Loader.ElementTemplate = new Loader.ElementTemplate();

            result.id = context.getAttributeAsString(node, "id", undefined, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "childnode":
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
