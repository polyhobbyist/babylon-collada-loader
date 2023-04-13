import { promises as fs } from 'fs';
import * as BABYLON from "babylonjs";
import * as Loader from "../loader/loader"
import * as Converter from "./converter"
import {RMXModelLoader} from "../model-loader"
import {RMXModel} from "../model"
import * as Utils from "./utils"
import {Log, LogLevel, LogConsole, LogCallback, LogFilter} from "../log"

export class ColladaConverter {
    log: Log;
    options: Converter.Options;

    constructor() {
        this.log = new LogConsole();
        this.options = new Converter.Options();
    }

    private forEachGeometry(doc: Converter.Document, fn: (geometry: Converter.Geometry) => void): void {
        for (var i: number = 0; i < doc.geometries.length; ++i) {
            fn(doc.geometries[i]);
        }
        Converter.Node.forEachNode(doc.nodes, (node: Converter.Node) => {
            for (var i: number = 0; i < node.geometries.length; ++i) {
                fn(node.geometries[i]);
            }
        });
    }

    convert(doc: Loader.Document): Converter.Document {
        var context: Converter.ConverterContext = new Converter.ConverterContext(this.log, this.options);

        if (!doc) {
            context.log.write("No document to convert", LogLevel.Warning);
            return null;
        }

        var result: Converter.Document = new Converter.Document();

        // Scene nodes
        result.nodes = ColladaConverter.createScene(doc, context);

        // Set up the world transform
        if (context.options.worldTransform.value) {

            // Add the world transform to scene nodes
            for (var i: number = 0; i < result.nodes.length; ++i) {
                Converter.Node.setupWorldTransform(result.nodes[i], context);
            }

            // Adapt inverse bind matrices
            this.forEachGeometry(result, (geometry) => {
                Converter.Geometry.setupWorldTransform(geometry, context);
            });

            // Bake: Apply the world transform to skinned geometries
            if (context.options.worldTransformBake.value) {
                var mat = Utils.getWorldTransform(context);
                this.forEachGeometry(result, (geometry) => {
                    if (geometry.getSkeleton() !== null) {
                        Converter.Geometry.transformGeometry(geometry, mat, context);
                    }
                });
            }
        }

        // Original animations curves
        if (context.options.enableAnimations.value === true) {
            result.animations = ColladaConverter.createAnimations(doc, context);
        }

        // Extract geometries
        if (context.options.enableExtractGeometry.value === true) {
            result.geometries = Converter.Node.extractGeometries(result.nodes, context);
        }

        // Merge chunk data
        if (context.options.singleBufferPerGeometry.value === true) {
            this.forEachGeometry(result, (geometry) => {
                Converter.GeometryChunk.mergeChunkData(geometry.chunks, context);
            });
        }

        // Resampled animations
        if (context.options.enableResampledAnimations.value === true) {
            result.resampled_animations = ColladaConverter.createResampledAnimations(doc, result, context);
        }

        // Compute bounding boxes
        Converter.Node.forEachNode(result.nodes, (node: Converter.Node) => {
            this.forEachGeometry(result, (geometry) => {
                Converter.Geometry.computeBoundingBox(geometry, context);
            });
        });

        return result;
    }

    static createScene(doc: Loader.Document, context: Converter.ConverterContext): Converter.Node[] {
        var result: Converter.Node[] = [];

        // Get the COLLADA scene
        if (!doc.scene) {
            context.log.write("Collada document has no scene", LogLevel.Warning);
            return result;
        }
        var scene: Loader.VisualScene = Loader.VisualScene.fromLink(doc.scene.instance, context);
        if (!scene) {
            context.log.write("Collada document has no scene", LogLevel.Warning);
            return result;
        }

        // Create converted nodes
        for (var i: number = 0; i < scene.children.length; ++i) {
            var topLevelNode: Loader.VisualSceneNode = scene.children[i];
            result.push(Converter.Node.createNode(topLevelNode, null, context));
        }

        // Create data (geometries, ...) for the converted nodes
        for (var i: number = 0; i < result.length; ++i) {
            var node: Converter.Node = result[i];
            Converter.Node.createNodeData(node, context);
        }

        return result;
    }

    static createAnimations(doc: Loader.Document, context: Converter.ConverterContext): Converter.Animation[] {
        var result: Converter.Animation[] = [];

        // Create converted animations
        for (var i: number = 0; i < doc.libAnimations.children.length; ++i) {
            var animation: Loader.Animation = doc.libAnimations.children[i];
            result.push(Converter.Animation.create(animation, context));
        }

        // If requested, create a single animation
        if (context.options.singleAnimation.value === true && result.length > 1) {
            var topLevelAnimation = new Converter.Animation();
            topLevelAnimation.id = "";
            topLevelAnimation.name = "animation";

            // Steal all channels from previous animations
            for (var i: number = 0; i < result.length; ++i) {
                var child: Converter.Animation = result[i];
                topLevelAnimation.channels = topLevelAnimation.channels.concat(child.channels);
                child.channels = [];
            }
            result = [topLevelAnimation];
        }

        return result;
    }

    static createResampledAnimations(doc: Loader.Document, file: Converter.Document, context: Converter.ConverterContext): Converter.AnimationData[] {
        var result: Converter.AnimationData[] = [];
        if (file.animations.length === 0) {
            // context.log.write("No original animations available, no resampled animations generated.", LogLevel.Warning);
            return [];
        }

        // Get the geometry
        if (file.geometries.length > 1) {
            context.log.write("Converted document contains multiple geometries, resampled animations are only generated for single geometries.", LogLevel.Warning);
            return [];
        }
        if (file.geometries.length === 0) {
            context.log.write("Converted document does not contain any geometries, no resampled animations generated.", LogLevel.Warning);
            return [];
        }
        var geometry: Converter.Geometry = file.geometries[0];

        // Process all animations in the document
        var fps: number = +context.options.animationFps.value;
        for (var i: number = 0; i < file.animations.length; ++i) {
            var animation: Converter.Animation = file.animations[i];

            if (context.options.useAnimationLabels.value === true) {
                var labels: Converter.AnimationLabel[] = context.options.animationLabels.value;
                var datas: Converter.AnimationData[] = Converter.AnimationData.createFromLabels(geometry.getSkeleton(), animation, labels, fps, context);
                result = result.concat(datas);
            } else {
                var data: Converter.AnimationData = Converter.AnimationData.create(geometry.getSkeleton(), animation, null, null, fps, context);
                if (data !== null) {
                    result.push(data);
                }
            }
        }

        return result;
    }
}
