import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class Library<T extends Loader.EElement> {
        children: T[];


        constructor() {
            this.children = [];
        }

        static parse<T extends Loader.EElement>(node: Node, parser: (child: Node, context: Loader.Context) => T, childName: string, context: Loader.Context): Loader.Library<T> {
            var result: Loader.Library<T> = new Loader.Library<T>();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case childName:
                        result.children.push(parser(child, context));
                        break;
                    case "extra":
                        context.reportUnhandledChild(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                        break;
                }
            });

            return result;
        }
    }
