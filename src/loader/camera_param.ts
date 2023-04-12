import * as Loader from "../loader/loader"

    export class CameraParam extends Loader.EElement {
        value: number = 0;

        constructor() {
            super();
            this._className += "CameraParam|";
        }

        /**
        *   Parses a camera parameter element.
        */
        static parse(node: Node, context: Loader.Context): Loader.CameraParam {
            var result: Loader.CameraParam = new Loader.CameraParam();

            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = node.nodeName;
            result.value = parseFloat(context.getTextContent(node));

            return result;
        }

    }
