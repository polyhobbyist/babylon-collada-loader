import * as Loader from "./loader"
import * as Utils from "./utils"

    /**
    *   An <asset> element.
    */
    export class Asset extends Loader.EElement {
        unit: number = 0;
        upAxis: string = "";

        constructor() {
            super();
            this._className += "Asset|";
        }

        static parse(node: Node, context: Loader.Context): Loader.Asset {
            var result: Loader.Asset = new Loader.Asset();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "unit":
                        result.unit = context.getAttributeAsFloat(child, "meter", 1, false);
                        break;
                    case "up_axis":
                        result.upAxis = context.getTextContent(child).toUpperCase().charAt(0);
                        break;
                    case "contributor":
                    case "created":
                    case "modified":
                    case "revision":
                    case "title":
                    case "subject":
                    case "keywords":
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