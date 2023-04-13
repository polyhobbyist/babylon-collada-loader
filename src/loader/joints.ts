import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class Joints extends Loader.EElement {
        joints: Loader.Input | undefined;
        invBindMatrices: Loader.Input | undefined;

        constructor() {
            super();
            this._className += "Joints|";
        }

        /**
        *   Parses a <joints> element.
        */
        static parse(node: Node, context: Loader.LoaderContext): Loader.Joints {
            var result: Loader.Joints = new Loader.Joints();

            var inputs: Loader.Input[] = [];

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "input":
                        var input: Loader.Input = Loader.Input.parse(child, false, context);
                        Loader.Joints.addInput(result, input, context);
                        inputs.push(input);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

        static addInput(joints: Loader.Joints, input: Loader.Input, context: Loader.LoaderContext) {
            switch (input.semantic) {
                case "JOINT":
                    joints.joints = input;
                    break;
                case "INV_BIND_MATRIX":
                    joints.invBindMatrices = input;
                    break;
                default:
                    context.log?.write("Unknown joints input semantic " + input.semantic, LogLevel.Error);
            }
        }

    }
