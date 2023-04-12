import * as Exporter from "./exporter"

    export class Document {
        json: Exporter.DocumentJSON;
        data: Uint8Array;

        constructor() {
            this.json = null;
            this.data = null;
        }
    }
