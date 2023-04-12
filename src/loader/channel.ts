/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="utils.ts" />

module COLLADA.Loader {

    export class Channel extends COLLADA.Loader.Element {
        source: UrlLink | undefined;
        target: SidLink | undefined;

        constructor() {
            super();
            this._className += "Channel|";
        }

        /**
        *   Parses a <channel> element.
        */
        static parse(node: Node, parent: COLLADA.Loader.Animation, context: COLLADA.Loader.Context): COLLADA.Loader.Channel {
            var result: COLLADA.Loader.Channel = new COLLADA.Loader.Channel();

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
}