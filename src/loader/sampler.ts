import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class Sampler extends Loader.EElement {
        input: Loader.Input | undefined;
        outputs: Loader.Input[];
        inTangents: Loader.Input[];
        outTangents: Loader.Input[];
        interpolation: Loader.Input | undefined;

        constructor() {
            super();
            this._className += "Sampler|";
            this.outputs = [];
            this.inTangents = [];
            this.outTangents = [];
        }

        static fromLink(link: Loader.Link, context: Context): Loader.Sampler | undefined{
            return Loader.EElement._fromLink<Loader.Sampler>(link, "Sampler", context);
        }

        /**
        *   Parses a <sampler> element.
        */
        static parse(node: Node, context: Loader.Context): Loader.Sampler {
            var result: Loader.Sampler = new Loader.Sampler();

            result.id = context.getAttributeAsString(node, "id", undefined, false);
            context.registerUrlTarget(result, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "input":
                        var input: Loader.Input = Loader.Input.parse(child, false, context);
                        Loader.Sampler?.addInput(result, input, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

        static addInput(sampler: Loader.Sampler, input: Loader.Input, context: Loader.Context) {
            switch (input.semantic) {
                case "INPUT":
                    sampler.input = input;
                    break;
                case "OUTPUT":
                    sampler.outputs.push(input);
                    break;
                case "INTERPOLATION":
                    sampler.interpolation = input;
                    break;
                case "IN_TANGENT":
                    sampler.inTangents.push(input);
                    break;
                case "OUT_TANGENT":
                    sampler.outTangents.push(input);
                    break;
                default:
                    context.log.write("Unknown sampler input semantic " + input.semantic, LogLevel.Error);
            }
        }

    }
