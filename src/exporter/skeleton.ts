import * as COLLADAContext from "../context"
import {Log, LogLevel} from "../log"
import * as Loader from "../loader/loader"
import * as Converter from "../converter/converter"
import * as Exporter from "./exporter"
import * as Utils from "./utils"
import {BoundingBoxJSON} from "./format"
import * as BABYLON from 'babylonjs';
import * as MathUtils from '../math'



    export class Skeleton {

        static toJSON(skeleton: Converter.Skeleton, context: Exporter.Context): Exporter.BoneJSON[] | undefined{
            if (!skeleton) {
                return undefined ;
            }

            // TODO: options for this
            var mat_tol: number = 6;
            var pos_tol: number = 6;
            var scl_tol: number = 3;
            var rot_tol: number = 6;

            var result: Exporter.BoneJSON[] = [];
            skeleton.bones.forEach((bone) => {

                // Bone default transform
                var mat: BABYLON.Matrix = bone.node.initialLocalMatrix;
                var pos = new BABYLON.Vector3(0, 0, 0);
                var rot= new BABYLON.Quaternion(0, 0, 0, 1);
                var scl= new BABYLON.Vector3(1, 1, 1);
                mat.decompose(scl, rot, pos);

                /* TODO Polyhobbyist

                // Bone inverse bind matrix
                var inv_bind_mat: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
                MathUtils.copyNumberArray(bone.invBindMatrix, inv_bind_mat, 16);

                result.push({
                    name: bone.name,
                    parent: skeleton.bones.indexOf(bone.parent),
                    skinned: bone.attachedToSkin,
                    inv_bind_mat: inv_bind_mat.map((x) => MathUtils.round(x, mat_tol)),
                    pos: pos.map((x) => MathUtils.round(x, pos_tol)),
                    rot: rot.map((x) => MathUtils.round(x, rot_tol)),
                    scl: scl.map((x) => MathUtils.round(x, scl_tol))
                });
                */
            });

            return result;
        }
    }
