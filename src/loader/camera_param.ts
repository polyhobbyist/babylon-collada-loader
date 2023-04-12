/// <reference path="context.ts" />
/// <reference path="element.ts" />

module COLLADA.Loader {

    export class CameraParam extends COLLADA.Loader.Element {
        value: number = 0;

        constructor() {
            super();
            this._className += "CameraParam|";
        }

        /**
        *   Parses a camera parameter element.
        */
        static parse(node: Node, context: COLLADA.Loader.Context): COLLADA.Loader.CameraParam {
            var result: COLLADA.Loader.CameraParam = new COLLADA.Loader.CameraParam();

            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = node.nodeName;
            result.value = parseFloat(context.getTextContent(node));

            return result;
        }

    }
}