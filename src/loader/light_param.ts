/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="utils.ts" />

module COLLADA.Loader {

    export class LightParam extends COLLADA.Loader.Element {
        value: number| undefined;

        constructor() {
            super();
            this._className += "LightParam|";
        }

        /**
        *   Parses a light parameter element.
        */
        static parse(node: Node, context: COLLADA.Loader.Context): COLLADA.Loader.LightParam {
            var result: COLLADA.Loader.LightParam = new COLLADA.Loader.LightParam();

            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = node.nodeName;
            result.value = context.getFloatContent(node);

            return result;
        }

    }
}