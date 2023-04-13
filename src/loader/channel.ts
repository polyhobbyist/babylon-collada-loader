import * as Loader from "./loader"
import * as Utils from "./utils"

    export class Channel extends Loader.EElement {
        source: Loader.UrlLink | undefined;
        target: Loader.SidLink | undefined;

        constructor() {
            super();
            this._className += "Channel|";
        }

        /**
        *   Parses a <channel> element.
        */
        static parse(node: Node, parent: Loader.Animation, context: Loader.LoaderContext): Loader.Channel {
            var result: Loader.Channel = new Loader.Channel();

            result.source = context.getAttributeAsUrlLink(node, "source", true);
            result.target = context.getAttributeAsSidLink(node, "target", parent.id, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
