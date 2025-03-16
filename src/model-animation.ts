/// <reference path="./stream-math.ts" />

import {vec3_stream_lerp, vec3_stream_copy, quat_stream_slerp, quat_stream_copy, mat4_stream_multiply, mat_stream_compose} from './stream-math'
import * as Model from './model'
import * as BABYLON from 'babylonjs';

/**
* Stores the transformation of all nodes.
*/
export class RMXPose {
    pos: Float32Array;
    rot: Float32Array;
    scl: Float32Array;
    world_matrices: Float32Array;

    constructor(node_count: number) {
        this.pos = new Float32Array(node_count * 3);
        this.rot = new Float32Array(node_count * 4);
        this.scl = new Float32Array(node_count * 3);
        this.world_matrices = new Float32Array(node_count * 16);
    }
}

/**
* Stores the transform matrices in a WebGL texture.
*/
export class RMXBoneMatrixTexture {
    width: number;
    height: number;
    data: Float32Array;

    constructor(node_count: number) {
        this.width = Math.ceil(Math.sqrt(node_count * 4));
        this.height = Math.ceil((node_count * 4) / this.width);
        this.data = new Float32Array(this.width * this.height * 4);
    }

    update(gl: WebGLRenderingContext) {
        // Texture update logic remains the same
    }
}

/**
* A collection of static functions to handle transform animations.
*/
export class RMXSkeletalAnimation {
    /** 
    * Exports all transform matrices of a pose to a flat number array
    */
    static exportPose(skeleton: Model.RMXSkeleton, pose: RMXPose, dest: Float32Array) {
        var world_matrices = pose.world_matrices;

        // Loop over all nodes
        var node_length: number = skeleton.bones.length;
        for (var b: number = 0; b < node_length; ++b) {
            var node = skeleton.bones[b];
            var inv_bind_mat = <Float32Array>node.inv_bind_mat;

            // Local matrix - local translation/rotation/scale composed into a matrix
            mat_stream_compose(world_matrices, b * 16, pose.pos, b * 3, pose.rot, b * 4, pose.scl, b * 3);

            // World matrix
            if (node.parent >= 0) {
                mat4_stream_multiply(world_matrices, b * 16, world_matrices, node.parent * 16, world_matrices, b * 16);
            }

            // Final transform matrix
            mat4_stream_multiply(dest, b * 16, world_matrices, b * 16, inv_bind_mat, 0);
        }
    }

    /** 
    * Reset the pose to the initial transform state
    */
    static resetPose(skeleton: Model.RMXSkeleton, pose: RMXPose) {
        var dest_pos: Float32Array = pose.pos;
        var dest_rot: Float32Array = pose.rot;
        var dest_scl: Float32Array = pose.scl;

        // Loop over all nodes
        var node_length: number = skeleton.bones.length;
        for (var b = 0; b < node_length; ++b) {
            var b3: number = b * 3;
            var b4: number = b * 4;

            // Node data
            var node = skeleton.bones[b];
            var node_pos = node.pos;
            var node_rot = node.rot;
            var node_scl = node.scl;

            vec3_stream_copy(dest_pos, b3, Float32Array.from(node_pos.asArray()), 0);
            quat_stream_copy(dest_rot, b4, Float32Array.from(node_rot.asArray()), 0);
            vec3_stream_copy(dest_scl, b3, Float32Array.from(node_scl.asArray()), 0);
        }
    }

    /** 
    * Computes an interpolation of the two poses pose_a and pose_b
    * At t==0, full weight is given to pose_a, at t==1, full weight is given to pose_b
    */
    static blendPose(pose_a: RMXPose, pose_b: RMXPose, t: number, result: RMXPose) {
        var node_length: number = result.pos.length / 3;
        for (var b = 0; b < node_length; ++b) {
            var b3: number = b * 3;
            var b4: number = b * 4;

            vec3_stream_lerp(result.pos, b3, pose_a.pos, b3, pose_b.pos, b3, t);
            quat_stream_slerp(result.rot, b4, pose_a.rot, b4, pose_b.rot, b4, t);
            vec3_stream_lerp(result.scl, b3, pose_a.scl, b3, pose_b.scl, b3, t);
        }
    }

    /** 
    * Sample the animation, store the result in pose
    */
    static sampleAnimation(animation: Model.RMXAnimation, skeleton: Model.RMXSkeleton, pose: RMXPose, frame: number) {
        var bones = skeleton.bones;
        var tracks = animation.tracks;

        var dest_pos: Float32Array = pose.pos;
        var dest_rot: Float32Array = pose.rot;
        var dest_scl: Float32Array = pose.scl;

        // Loop over all nodes
        var node_length: number = bones.length;
        for (var b = 0; b < node_length; ++b) {
            var b3: number = b * 3;
            var b4: number = b * 4;

            // Animation track data
            var track = tracks[b];
            var track_pos = track?.pos;
            var track_rot = track?.rot;
            var track_scl = track?.scl;

            // Node data
            var node = bones[b];
            var node_pos = node.pos;
            var node_rot = node.rot;
            var node_scl = node.scl;

            // Position (linear interpolation)
            if (track_pos) {
                vec3_stream_lerp(dest_pos, b3, track_pos, frame * 3, track_pos, (frame + 1) * 3, frame % 1);
            } else {
                vec3_stream_copy(dest_pos, b3, Float32Array.from(node_pos.asArray()), 0);
            }

            // Rotation (quaternion spherical interpolation)
            if (track_rot) {
                quat_stream_slerp(dest_rot, b4, track_rot, frame * 4, track_rot, (frame + 1) * 4, frame % 1);
            } else {
                quat_stream_copy(dest_rot, b4, Float32Array.from(node_rot.asArray()), 0);
            }

            // Scale (linear interpolation)
            if (track_scl) {
                vec3_stream_lerp(dest_scl, b3, track_scl, frame * 3, track_scl, (frame + 1) * 3, frame % 1);
            } else {
                vec3_stream_copy(dest_scl, b3, Float32Array.from(node_scl.asArray()), 0);
            }
        }
    }
}
