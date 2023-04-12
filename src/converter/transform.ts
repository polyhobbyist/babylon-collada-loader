/// <reference path="../math.ts" />
/// <reference path="animation_channel.ts" />
/// <reference path="animation.ts" />
import * as BABYLON from 'babylonjs';

module COLLADA.Converter {

    export enum TransformType {
        Translation = 1,
        Rotation = 2,
        Scale = 3
    };

    export class Transform {
        data: Float32Array;
        original_data: Float32Array;
        rows: number;
        colums: number;
        channels: COLLADA.Converter.AnimationChannel[] | undefined;

        constructor(transform: COLLADA.Loader.NodeTransform, rows: number, columns: number) {
            this.rows = rows;
            this.colums = columns;
            this.channels = [];
            var data_elements: number = rows * columns;
            this.data = new Float32Array(data_elements);
            this.original_data = new Float32Array(data_elements);
            for (var i = 0; i < data_elements; ++i) {
                this.data[i] = transform.data[i];
                this.original_data[i] = transform.data[i];
            }
        }
        getTargetDataRows(): number {
            return this.rows;
        }
        getTargetDataColumns(): number {
            return this.colums;
        }
        applyAnimation(channel: COLLADA.Converter.AnimationChannel, time: number, context: COLLADA.Converter.Context) {
            COLLADA.Converter.AnimationChannel?.applyToData(channel, this.data, time, context);
            this.updateFromData();
        }
        registerAnimation(channel: COLLADA.Converter.AnimationChannel): void {
            this.channels?.push(channel);
        }
        isAnimated(): boolean {
            return this.channels?this.channels.length > 0:false;
        }
        isAnimatedBy(animation: COLLADA.Converter.Animation): boolean {
            if (animation !== null && this.channels) {
                for (var i: number = 0; i < this.channels.length || 0; ++i) {
                    var channel: COLLADA.Converter.AnimationChannel = this.channels[i];
                    if (animation.channels.indexOf(channel) !== -1) {
                        return true;
                    }
                }
                return false;
            } else {
                return this.channels?this.channels.length > 0:0;
            }
        }
        resetAnimation() {
            for (var i = 0; i < this.data.length; ++i) {
                this.data[i] = this.original_data[i];
            }
            this.updateFromData();
        }
        applyTransformation(mat: BABYLON.Matrix) {
            throw new Error("Not implemented");
        }
        updateFromData() {
            throw new Error("Not implemented");
        }
        hasTransformType(type: COLLADA.Converter.TransformType): boolean {
            throw new Error("Not implemented");
        }
    }

    export class TransformMatrix extends Transform implements COLLADA.Converter.AnimationTarget {
        matrix: BABYLON.Matrix;
        constructor(transform: COLLADA.Loader.NodeTransform) {
            super(transform, 4, 4);
            this.matrix = new BABYLON.Matrix();
            this.updateFromData();
        }
        updateFromData() {
            COLLADA.MathUtils.mat4Extract(this.data, 0, this.matrix);
        }
        applyTransformation(mat: BABYLON.Matrix) {
            this.matrix.multiply(this.matrix);
        }
        hasTransformType(type: COLLADA.Converter.TransformType): boolean {
            return true;
        }
    }

    export class TransformRotate extends Transform implements COLLADA.Converter.AnimationTarget {
        /** Source data: axis */
        axis: BABYLON.Vector3 = new BABYLON.Vector3;
        /** Source data: angle */
        radians: number;
        constructor(transform: COLLADA.Loader.NodeTransform) {
            super(transform, 4, 1);
            this.axis = new BABYLON.Vector3;
            this.radians = 0;
            this.updateFromData();
        }
        updateFromData() {
            this.axis.set(this.data[0], this.data[1], this.data[2]);
            this.radians = this.data[3] / 180 * Math.PI;
        }
        applyTransformation(mat: BABYLON.Matrix) {
            let r = BABYLON.Matrix.RotationAxis(this.axis, this.radians);
            
            mat.multiply(r);
        }
        hasTransformType(type: COLLADA.Converter.TransformType): boolean {
            return (type === COLLADA.Converter.TransformType.Rotation);
        }
    }

    export class TransformTranslate extends Transform implements COLLADA.Converter.AnimationTarget {
        /** Source data: translation */
        pos: BABYLON.Vector3 = new BABYLON.Vector3();
        constructor(transform: COLLADA.Loader.NodeTransform) {
            super(transform, 3, 1);
            this.updateFromData();
        }
        updateFromData() {
            this.pos.set(this.data[0], this.data[1], this.data[2]);
        }
        applyTransformation(mat: BABYLON.Matrix) {
            let t = BABYLON.Matrix.Translation(this.pos.x, this.pos.y, this.pos.z);
            mat.multiply(t);
        }
        hasTransformType(type: COLLADA.Converter.TransformType): boolean {
            return (type === COLLADA.Converter.TransformType.Translation);
        }
    }

    export class TransformScale extends Transform implements COLLADA.Converter.AnimationTarget {
        /** Source data: scaling */
        scl: BABYLON.Vector3 = new BABYLON.Vector3();
        constructor(transform: COLLADA.Loader.NodeTransform) {
            super(transform, 3, 1);
            this.updateFromData();
        }
        updateFromData() {
            this.scl.set(this.data[0], this.data[1], this.data[2]);
        }
        applyTransformation(mat: BABYLON.Matrix) {
            let t = BABYLON.Matrix.Scaling(this.scl.x, this.scl.y, this.scl.z);
            mat.multiply(t);
        }
        hasTransformType(type: COLLADA.Converter.TransformType): boolean {
            return (type === COLLADA.Converter.TransformType.Scale);
        }
    }
}