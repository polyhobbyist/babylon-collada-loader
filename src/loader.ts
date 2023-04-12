/// <reference path="./log.ts" />

import * as BABYLON from "babylonjs";

module COLLADA {
export class ColladaLoader {
        onFinished: ((id: string, doc?: COLLADA.Loader.Document) => void) | undefined;
        onProgress: ((id: string, loaded: number, total: number) => void) | undefined;
        log: Log;

        constructor() {
            this.log = new LogConsole();
        }

        private _reportError(id: string, context: COLLADA.Loader.Context) {
            if (this.onFinished) {
                this.onFinished(id, undefined);
            }
        }

        private _reportSuccess(id: string, doc: COLLADA.Loader.Document, context: COLLADA.Loader.Context) {
            if (this.onFinished) {
                this.onFinished(id, doc);
            }
        }

        private _reportProgress(id: string, context: COLLADA.Loader.Context) {
            if (this.onProgress) {
                this.onProgress(id, context.loadedBytes, context.totalBytes);
            }
        }

        loadFromXML(id: string, doc: XMLDocument): COLLADA.Loader.Document {
            var context: COLLADA.Loader.Context = new COLLADA.Loader.Context(this.log);
            return this._loadFromXML(id, doc, context);
        }

        private _loadFromXML(id: string, doc: XMLDocument, context: COLLADA.Loader.Context): COLLADA.Loader.Document | undefined {
            var result: COLLADA.Loader.Document | undefined = undefined;
            try {
                result = COLLADA.Loader.Document.parse(doc, context);
                context.resolveAllLinks();
            } catch (err) {
                context.log.write(err.message, LogLevel.Exception);
                this._reportError(id, context);
                return undefined;
            }
            this._reportSuccess(id, result, context);
            return result;
        }

        loadFromURL(id: string, url: string) {
            var context: COLLADA.Loader.Context = new COLLADA.Loader.Context();
            context.log = this.log;
            var loader: ColladaLoader = this;

            if (document != null && document.implementation != null && document.implementation.createDocument != null) {

                var req: XMLHttpRequest = new XMLHttpRequest();
                if (typeof req.overrideMimeType === "function") {
                    req.overrideMimeType("text/xml");
                }

                req.onreadystatechange = function () {
                    if (req.readyState === 4) {
                        if (req.status === 0 || req.status === 200) {
                            if (req.responseXML) {
                                var result: COLLADA.Loader.Document = COLLADA.Loader.Document.parse(req.responseXML, context);
                                loader._reportSuccess(id, result, context);
                            } else {
                                context.log.write("Empty or non-existing file " + url + ".", LogLevel.Error);
                                loader._reportError(id, context);
                            }
                        }
                    } else if (req.readyState === 3) {
                        if (!(context.totalBytes > 0)) {
                            context.totalBytes = parseInt(req.getResponseHeader("Content-Length") || "0");
                        }
                        context.loadedBytes = req.responseText.length;
                        loader._reportProgress(id, context);
                    }
                };
                req.open("GET", url, true);
                req.send(null);
            } else {
                context.log.write("Don't know how to parse XML!", LogLevel.Error);
                loader._reportError(id, context);
            }
        }
    }
}