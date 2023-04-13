import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "./loader"
import * as Converter from "../converter/converter"
import * as Exporter from "../exporter/exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class Geometry extends Loader.EElement {
        sources: Loader.Source[];
        vertices: Loader.Vertices[];
        triangles: Loader.Triangles[];

        constructor() {
            super();
            this._className += "Geometry|";
            this.sources = [];
            this.vertices = [];
            this.triangles = [];
        }

        static fromLink(link: Loader.Link, context: Context): Loader.Geometry | undefined{
            return Loader.EElement._fromLink<Loader.Geometry>(link, "Geometry", context);
        }

        /**
        *   Parses a <geometry> element
        */
        static parse(node: Node, context: Loader.LoaderContext): Loader.Geometry {
            var result: Loader.Geometry = new Loader.Geometry();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "mesh":
                        Loader.Geometry.parseMesh(child, result, context);
                        break;
                    case "convex_mesh":
                    case "spline":
                        context.log.write("Geometry type " + child.nodeName + " not supported.", LogLevel.Error);
                        break;
                    case "extra":
                        Loader.Geometry.parseGeometryExtra(child, result, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

        /**
        *   Parses a <geometry>/<mesh> element
        */
        static parseMesh(node: Node, geometry: Loader.Geometry, context: Loader.LoaderContext) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "source":
                        geometry.sources.push(Loader.Source.parse(child, context));
                        break;
                    case "vertices":
                        geometry.vertices.push(Loader.Vertices.parse(child, context));
                        break;
                    case "triangles":
                    case "polylist":
                    case "polygons":
                        geometry.triangles.push(Loader.Triangles.parse(child, context));
                        break;
                    case "lines":
                    case "linestrips":
                    case "trifans":
                    case "tristrips":
                        context.log.write("Geometry primitive type " + child.nodeName + " not supported.", LogLevel.Error);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }

        /**
        *   Parses a <geometry>/<extra> element
        */
        static parseGeometryExtra(node: Node, geometry: Loader.Geometry, context: Loader.LoaderContext) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "technique":
                        var profile: string = context.getAttributeAsString(child, "profile", undefined, true);
                        Loader.Geometry.parseGeometryExtraTechnique(child, geometry, profile, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }

        /**
        *   Parses a <geometry>/<extra>/<technique> element
        */
        static parseGeometryExtraTechnique(node: Node, geometry: Loader.Geometry, profile: string, context: Loader.LoaderContext) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    default:
                        context.reportUnhandledChild(child);
                }
            });
        }
    };


    export class GeometryLibrary extends Loader.EElement {
        children: Geometry[] = [];

        static parse(node: Node, context: Loader.LoaderContext): GeometryLibrary {
            var result: GeometryLibrary = new GeometryLibrary();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "geometry":
                        result.children.push(Geometry.parse(child, context));
                        break;
                    case "extra":
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
