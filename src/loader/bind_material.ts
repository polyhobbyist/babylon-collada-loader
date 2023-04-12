import * as Loader from "../loader/loader"
import * as Utils from "./utils"

    export class BindMaterial {

        /**
        *   Parses a <bind_material> element. Can be child of <instance_geometry> or <instance_controller>
        */
        static parse(node: Node, parent: Loader.InstanceMaterialContainer, context: Loader.Context) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "technique_common":
                        Loader.BindMaterial.parseTechniqueCommon(child, parent, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }

        /**
        *   Parses a <instance_geometry>/<bind_material>/<technique_common> element.
        */
        static parseTechniqueCommon(node: Node, parent: Loader.InstanceMaterialContainer, context: Loader.Context) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "instance_material":
                        parent.materials.push(Loader.InstanceMaterial.parse(child, parent, context));
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }
    }
