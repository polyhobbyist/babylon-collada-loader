/// <reference path="context.ts" />
/// <reference path="element.ts" />
/// <reference path="visual_scene_node.ts" />
/// <reference path="utils.ts" />


module COLLADA.Loader {

    /**
    *   An <visual_scene> element.
    */
    export class VisualScene extends COLLADA.Loader.EElement {
        children: COLLADA.Loader.VisualSceneNode[];

        constructor() {
            super();
            this._className += "VisualScene|";
            this.children = [];
        }

        static fromLink(link: Link, context: COLLADA.Context): COLLADA.Loader.VisualScene | undefined {
            return COLLADA.Loader.EElement._fromLink<COLLADA.Loader.VisualScene>(link, "VisualScene", context);
        }

        static parse(node: Node, context: COLLADA.Loader.Context): COLLADA.Loader.VisualScene {
            var result: COLLADA.Loader.VisualScene = new COLLADA.Loader.VisualScene();

            result.id = context.getAttributeAsString(node, "id", "", false);

            context.registerUrlTarget(result, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "node":
                        var childNode: COLLADA.Loader.VisualSceneNode = COLLADA.Loader.VisualSceneNode.parse(child, context);
                        COLLADA.Loader.VisualSceneNode.registerParent(childNode, result, context);
                        result.children.push(childNode);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                        break;
                }
            });

            return result;
        }
    };
}