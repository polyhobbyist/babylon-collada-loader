import * as BABYLON from 'babylonjs';

module COLLADA.Converter {

    export class Utils {

        /**
        * Re-indexes data.
        * Copies srcData[srcIndices[i*srcStride + srcOffset]] to destData[destIndices[i*destStride + destOffset]]
        *
        * Used because in COLLADA, each geometry attribute (position, normal, ...) can have its own index buffer,
        * whereas for GPU rendering, there is only one index buffer for the whole geometry.
        *
        */
        static reIndex(
            srcData: Float32Array, srcIndices: Uint32Array, srcStride: number, srcOffset: number, srcDim: number,
            destData: Float32Array, destIndices: Uint32Array, destStride: number, destOffset: number, destDim: number) {

            var dim: number = Math.min(srcDim, destDim);
            var srcIndexCount: number = srcIndices.length;

            // Index in the "indices" array at which the next index can be found
            var srcIndexIndex: number = srcOffset;
            var destIndexIndex: number = destOffset;

            while (srcIndexIndex < srcIndexCount) {

                // Index in the "data" array at which the vertex data can be found
                var srcIndex: number = srcIndices[srcIndexIndex];
                srcIndexIndex += srcStride;
                var destIndex: number = destIndices[destIndexIndex];
                destIndexIndex += destStride;

                // Copy vertex data (one value for each dimension)
                for (var d: number = 0; d < dim; ++d) {
                    destData[srcDim * destIndex + d] = srcData[destDim * srcIndex + d];
                }
            }
        }

        /**
        * Given a list of indices stored as indices[i*stride + offset],
        * returns a similar list of indices stored as an array of consecutive numbers.
        */
        static compactIndices(indices: Uint32Array, stride: number, offset: number): Uint32Array {
            var uniqueCount: number = 0;
            var indexCount = indices.length / stride;
            var uniqueMap: Uint32Array = new Uint32Array(indexCount);

            var invalidIndex: number = 0xffffff;

            // Find out which indices are unique and which appeared previously
            for (var i: number = 0; i < indexCount; ++i) {

                var previousIndex: number = invalidIndex;
                for (var j: number = 0; j < i; ++j) {
                    if (indices[j * stride + offset] === indices[i * stride + offset]) {
                        previousIndex = j;
                        break;
                    }
                }

                uniqueMap[i] = previousIndex;
                if (previousIndex !== invalidIndex) {
                    uniqueCount++;
                }
            }

            // Create new indices
            var result: Uint32Array = new Uint32Array(indexCount);
            var nextIndex = 0;
            for (var i: number = 0; i < indexCount; ++i) {
                var previousIndex = uniqueMap[i];
                if (previousIndex === invalidIndex) {
                    result[i] = nextIndex;
                    nextIndex++;
                } else {
                    result[i] = result[previousIndex];
                }
            }

            return result;
        }

        /**
        * Returns the maximum element of a list of non-negative integers
        */
        static maxIndex(indices: Uint32Array): number {
            if (indices === null) {
                return 0;
            }
            var result: number = -1;
            var length: number = indices.length
        for (var i: number = 0; i < length; ++i) {
                if (indices[i] > result) result = indices[i];
            }
            return result;
        }

        static createFloatArray(source: COLLADA.Loader.Source, name: string, outDim: number, context: COLLADA.Context): Float32Array {
            if (source === null) {
                return new Float32Array();
            }

            if (source.stride > outDim) {
                context.log.write("Source data for " + name + " contains too many dimensions, " + (source.stride - outDim) + " dimensions will be ignored", COLLADA.LogLevel.Warning);
            } else if (source.stride < outDim) {
                context.log.write("Source data for " + name + " does not contain enough dimensions, " + (outDim - source.stride) + " dimensions will be zero", COLLADA.LogLevel.Warning);
            }

            // Start and end index
            var iBegin: number = source.offset;
            var iEnd: number = source.offset + source.count * source.stride;
            if (iEnd > source.data.length) {
                context.log.write("Source for " + name + " tries to access too many elements, data ignored", COLLADA.LogLevel.Warning);
                return new Float32Array();
            }

            // Get source raw data
            if (!(source.data instanceof Float32Array)) {
                context.log.write("Source for " + name + " does not contain floating point data, data ignored", COLLADA.LogLevel.Warning);
                return new Float32Array();
            }
            var srcData: Float32Array = <Float32Array>source.data;

            // Copy data
            var result = new Float32Array(source.count * outDim);
            var src_offset = source.offset;
            var src_stride = source.stride;
            var dest_offset = 0;
            var dest_stride = outDim;
            for (var i: number = 0; i < source.count; ++i) {
                for (var j: number = 0; j < outDim; ++j) {
                    result[dest_offset + dest_stride * i + j] = srcData[src_offset + src_stride*i + j];
                }
            }
            return result;
        }

        static createStringArray(source: COLLADA.Loader.Source, name: string, outDim: number, context: COLLADA.Context): string[] {
            if (source === null) {
                return [];
            }
            if (source.stride > outDim) {
                context.log.write("Source data for " + name + " contains too many dimensions, " + (source.stride - outDim) + " dimensions will be ignored", LogLevel.Warning);
            } else if (source.stride < outDim) {
                context.log.write("Source data for " + name + " does not contain enough dimensions, " + (outDim - source.stride) + " dimensions will be zero", LogLevel.Warning);
            }

            // Start and end index
            var iBegin: number = source.offset;
            var iEnd: number = source.offset + source.count * source.stride;
            if (iEnd > source.data.length) {
                context.log.write("Source for " + name + " tries to access too many elements, data ignored", LogLevel.Warning);
                return [];
            }

            // Get source raw data
            if (!(source.data instanceof Array)) {
                context.log.write("Source for " + name + " does not contain string data, data ignored", LogLevel.Warning);
                return [];
            }
            var srcData: string[] = <string[]> source.data;

            // Copy data
            var result: string[] = new Array(source.count * outDim);
            var src_offset = source.offset;
            var src_stride = source.stride;
            var dest_offset = 0;
            var dest_stride = outDim;
            for (var i: number = 0; i < source.count; ++i) {
                for (var j: number = 0; j < outDim; ++j) {
                    result[dest_offset + dest_stride * i + j] = srcData[src_offset + src_stride * i + j];
                }
            }
            return result;
        }

        static spawElements(array: Float32Array, i1: number, i2: number): void {
            var temp = array[i1];
            array[i1] = array[i2];
            array[i2] = temp;
        }

        static insertBone(indices: Float32Array, weights: Float32Array, index: number, weight: number, offsetBegin: number, offsetEnd: number) {

            if (weights[offsetEnd] < weight) {

                // Insert at last position
                weights[offsetEnd] = weight;
                indices[offsetEnd] = index;

                // Bubble towards the front
                for (var i = offsetEnd; i > offsetBegin; --i) {
                    if (weights[i] > weights[i - 1]) {
                        Utils.spawElements(weights, i, i - 1);
                        Utils.spawElements(indices, i, i - 1);
                    }
                }
            }
        }

        private static worldTransform: BABYLON.Matrix = new BABYLON.Matrix();
        static getWorldTransform(context: COLLADA.Converter.Context): BABYLON.Matrix {
            var mat: BABYLON.Matrix = Utils.worldTransform;
            mat.copyFrom(Utils.getWorldRotation(context));
            var s = Utils.getWorldScale(context);
            var matScale = BABYLON.Matrix.Scaling(s.x, s.y, s.z);
            mat = mat.multiply(mat, );
            return mat;
        }

        private static worldInvTransform: BABYLON.Matrix = new BABYLON.Matrix();
        static getWorldInvTransform(context: COLLADA.Converter.Context): BABYLON.Matrix {
            var mat: BABYLON.Matrix = Utils.getWorldTransform(context);
            mat.copyFrom(Utils.getWorldRotation(context));
            mat.invert();
            return Utils.worldInvTransform;
        }

        private static worldScale: BABYLON.Vector3 = new BABYLON.Vector3();
        static getWorldScale(context: COLLADA.Converter.Context): BABYLON.Vector3 {
            var scale: number = context.options.worldTransformScale.value;
            Utils.worldScale = new BABYLON.Vector3(scale, scale, scale);
            return Utils.worldScale;
        }

        private static worldInvScale: BABYLON.Vector3 = new BABYLON.Vector3();
        static getWorldInvScale(context: COLLADA.Converter.Context): BABYLON.Vector3 {
            var invScale: number = 1 / context.options.worldTransformScale.value;
            Utils.worldInvScale = new BABYLON.Vector3(invScale, invScale, invScale);
            return Utils.worldInvScale;
        }

        private static worldRotation: BABYLON.Matrix = new BABYLON.Matrix();
        static getWorldRotation(context: COLLADA.Converter.Context): BABYLON.Matrix {
            var rotationAxis: string = context.options.worldTransformRotationAxis.value;
            var rotationAngle: number = context.options.worldTransformRotationAngle.value * Math.PI / 180;

            var mat: BABYLON.Matrix = Utils.worldRotation;

            switch (rotationAxis) {
                case "none": break;
                case "x": mat = BABYLON.Matrix.RotationX(rotationAngle); break;
                case "y": mat = BABYLON.Matrix.RotationY(rotationAngle); break;
                case "z": mat = BABYLON.Matrix.RotationZ(rotationAngle); break;
                default: context.log.write("Unknown rotation axis", LogLevel.Warning); break;
            }

            return mat;
        }
    }
}