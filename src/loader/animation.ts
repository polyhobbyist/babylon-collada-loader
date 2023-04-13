import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Utils from "./utils"
import * as MathUtils from "../math"



    export class Animation extends Loader.EElement {
        parent: Loader.Animation | undefined;
        children: Loader.Animation[];
        sources: Loader.Source[];
        samplers: Loader.Sampler[];
        channels: Loader.Channel[];

        constructor() {
            super();
            this._className += "Animation|";
            this.children = [];
            this.sources = [];
            this.samplers = [];
            this.channels = [];
        }

        root(): Loader.Animation {
            if (this.parent != null) {
                return this.parent.root();
            } else {
                return this;
            }
        }

        /**
        *   Parses an <animation> element.
        */
        static parse(node: Node, context: Loader.LoaderContext): Loader.Animation {
            var result: Loader.Animation = new Loader.Animation();

            result.id = context.getAttributeAsString(node, "id", undefined, false);
            result.name = context.getAttributeAsString(node, "name", undefined, false);

            context.registerUrlTarget(result, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "animation":
                        var animation: Loader.Animation = Loader.Animation.parse(child, context);
                        animation.parent = result;
                        result.children.push(animation);
                        break;
                    case "source":
                        result.sources.push(Loader.Source.parse(child, context));
                        break;
                    case "sampler":
                        result.samplers.push(Loader.Sampler.parse(child, context));
                        break;
                    case "channel":
                        result.channels.push(Loader.Channel.parse(child, result, context));
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    };

    
    export class AnimationLibrary extends Loader.EElement {
        children: Animation[] = [];

        static parse(node: Node, context: Loader.LoaderContext): AnimationLibrary {
            var result: AnimationLibrary = new AnimationLibrary();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "animation":
                        result.children.push(Animation.parse(child, context));
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
