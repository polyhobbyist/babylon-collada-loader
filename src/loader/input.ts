/// <reference path="context.ts" />
/// <reference path="element.ts" />

module COLLADA.Loader {

    export class Input extends COLLADA.Loader.Element {
        /** "VERTEX", "POSITION", "NORMAL", "TEXCOORD", ... */
        semantic: string = "";
        /** URL of source object */
        source: UrlLink | undefined;
        /** Offset in index array */
        offset: number = 0;
        /** Optional set identifier */
        set: number = 0;

        constructor() {
            super();
            this._className += "Input|";
        }

        /**
        *   Parses an <input> element.
        */
        static parse(node: Node, shared: boolean, context: COLLADA.Loader.Context): COLLADA.Loader.Input {
            var result: COLLADA.Loader.Input = new COLLADA.Loader.Input();

            result.semantic = context.getAttributeAsString(node, "semantic", undefined, true);
            result.source = context.getAttributeAsUrlLink(node, "source", true);

            if (shared) {
                result.offset = context.getAttributeAsInt(node, "offset", 0, true);
                result.set = context.getAttributeAsInt(node, "set", 0, false);
            }

            return result;
        }
    }
}