/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="bind_material.ts" />
/// <reference path="instance_material.ts" />
/// <reference path="utils.ts" />

module COLLADA.Loader {

    export interface InstanceControllerContainer extends COLLADA.Loader.EElement {
        controllers: COLLADA.Loader.InstanceController[];
    }

    export class InstanceController extends COLLADA.Loader.EElement {
        controller: Link | undefined;
        skeletons: Link[];
        materials: COLLADA.Loader.InstanceMaterial[];

        constructor() {
            super();
            this._className += "InstanceController|";
            this.skeletons = [];
            this.materials = [];
        }

        /**
        *   Parses a <instance_controller> element.
        */
        static parse(node: Node, parent: COLLADA.Loader.InstanceControllerContainer, context: COLLADA.Loader.Context): COLLADA.Loader.InstanceController {
            var result: COLLADA.Loader.InstanceController = new COLLADA.Loader.InstanceController();

            result.controller = context.getAttributeAsUrlLink(node, "url", true);
            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerSidTarget(result, parent);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "skeleton":
                        result.skeletons.push(context.createUrlLink(context.getTextContent(child)));
                        break;
                    case "bind_material":
                        COLLADA.Loader.BindMaterial.parse(child, result, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    };
}