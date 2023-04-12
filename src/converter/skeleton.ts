import {Context} from "../context"
import {Log, LogLevel} from "../log"
import * as Loader from "../loader/loader"
import * as Converter from "./converter"
import * as Utils from "./utils"
import * as MathUtils from "../math"
import {Bone} from "./bone"
import {Texture} from "./texture"
import {AnimationTarget} from "./animation"
import * as COLLADAContext from "../context"
import {Options} from "./options"
import {BoundingBox} from "./bounding_box"
import * as BABYLON from 'babylonjs';

    export class Skeleton {
        /** All bones */
        bones: Bone[];

        constructor(bones: Bone[]) {
            this.bones = bones;
        }

        /**
        * In the given list, finds a bone that can be merged with the given bone
        */
        static findBone(bones: Bone[], bone: Bone): Bone {
            for (var i = 0; i < bones.length; ++i) {
                if (Bone.safeToMerge(bones[i], bone)) {
                    return bones[i];
                }
            }
            return null;
        }

        /**
        * Find the parent bone of the given bone
        */
        static findParent(bones: Bone[], bone: Bone): Bone {
            if (bone.parent === null) {
                return null;
            }
            for (var i = 0; i < bones.length; ++i) {
                if (bones[i].node === bone.parent.node) {
                    return bones[i];
                }
            }
            return null;
        }

        static checkConsistency(skeleton: Skeleton, context: Context): void {
            skeleton.bones.forEach((b1, i1) => {
                skeleton.bones.forEach((b2, i2) => {
                    if (i1 !== i2 && Bone.safeToMerge(b1, b2)) {
                        throw new Error("Duplicate bone");
                    }
                });
            });

            skeleton.bones.forEach((b) => {
                if (b.parent !== null && b.node.parent === null) {
                    throw new Error("Missing parent");
                }
            });

            skeleton.bones.forEach((b) => {
                if (b.parent !== null && skeleton.bones.indexOf(b.parent) === -1) {
                    throw new Error("Invalid parent");
                }
            });
        }

        /**
        * Creates a skeleton from a skin
        */
        static createFromSkin(jointSids: string[], skeletonRootNodes: Loader.VisualSceneNode[], bindShapeMatrix: BABYLON.Matrix,
            invBindMatrices: Float32Array, context: Converter.Context): Converter.Skeleton {
            var bones: Converter.Bone[] = [];

            // Add all bones referenced by the skin
            for (var i: number = 0; i < jointSids.length; i++) {
                var jointSid: string = jointSids[i];
                var jointNode: Loader.VisualSceneNode = Converter.Bone.findBoneNode(jointSid, skeletonRootNodes, context);
                if (jointNode === null) {
                    context.log.write("Joint " + jointSid + " not found for skeleton, no bones created", LogLevel.Warning);
                    return new Skeleton([]);
                }
                var converterNode: Converter.Node = context.nodes.findConverter(jointNode);
                if (converterNode === null) {
                    context.log.write("Joint " + jointSid + " not converted for skeleton, no bones created", LogLevel.Warning);
                    return new Skeleton([]);
                }
                var bone: Converter.Bone = Converter.Bone.create(converterNode);
                bone.attachedToSkin = true;

                MathUtils.mat4Extract(invBindMatrices, i, bone.invBindMatrix);
                // Collada skinning equation: boneWeight*boneMatrix*invBindMatrix*bindShapeMatrix*vertexPos
                // (see chapter 4: "Skin Deformation (or Skinning) in COLLADA")
                // Here we could pre-multiply the inverse bind matrix and the bind shape matrix
                // We do not pre-multiply the bind shape matrix, because the same bone could be bound to
                // different meshes using different bind shape matrices and we would have to duplicate the bones
                // mat4.multiply(bone.invBindMatrix, bone.invBindMatrix, bindShapeMatrix);
                bones.push(bone);
            }

            var result = new Skeleton(bones);

            // Add all missing bones of the skeleton
            result = Converter.Skeleton.addBoneParents(result, context);

            Skeleton.checkConsistency(result, context);
            return result;
        }

        /**
        * Creates a skeleton from a node
        */
        static createFromNode(node: Converter.Node, context: Converter.Context): Converter.Skeleton {
            // Create a single node
            var colladaNode: Loader.VisualSceneNode = context.nodes.findCollada(node);
            var bone: Converter.Bone = Converter.Bone.create(node);
            bone.invBindMatrix = BABYLON.Matrix.Identity()
            bone.attachedToSkin = true;

            var result = new Skeleton([bone]);

            // Add all parent bones of the skeleton
            result = Converter.Skeleton.addBoneParents(result, context);

            Skeleton.checkConsistency(result, context);
            return result;
        }


        static replaceBone(bones: Bone[], index: number, bone: Bone): Bone[]{
            var result = bones.slice(0);
            var oldBone = result[index];
            result[index] = bone;
            result.forEach((b) => {
                if (b.parent === oldBone) {
                    b.parent = bone;
                }
            });
            return result;
        }

        /**
        * Add a bone to the list of bones, merging bones where possible
        */
        static mergeBone(bones: Bone[], bone: Bone): Bone[]{
            
            for (var i = 0; i < bones.length; ++i) {
                if (Bone.safeToMerge(bones[i], bone)) {
                    var mergedBone = Bone.mergeBone(bones[i], bone);
                    return Skeleton.replaceBone(bones, i, mergedBone);
                }
            }

            // No merge possible
            var result = bones.slice(0);
            var newBone = bone.clone();
            result.push(newBone);
            newBone.parent = Skeleton.findParent(result, newBone);
            return result;
        }

        /**
        * Merges the two skeletons
        */
        static mergeSkeletons(skeleton1: Skeleton, skeleton2: Skeleton, context: Context): Skeleton {
            var bones: Bone[] = [];
            var skinBones: Bone[] = [];

            // Add all bones from skeleton1
            skeleton1.bones.forEach((b) => {
                bones = Skeleton.mergeBone(bones, b);
            });

            // Add all bones from skeleton2 (if not already present)
            skeleton2.bones.forEach((b) => {
                bones = Skeleton.mergeBone(bones, b);
            });

            var result = new Skeleton(bones);

            Skeleton.checkConsistency(result, context);
            return result;
        }

        /**
        * Assembles a list of skeleton root nodes
        */
        static getSkeletonRootNodes(skeletonLinks: Loader.Link[], context: Converter.Context): Loader.VisualSceneNode[] {
            var skeletonRootNodes: Loader.VisualSceneNode[] = [];
            for (var i: number = 0; i < skeletonLinks.length; i++) {
                var skeletonLink: Loader.Link = skeletonLinks[i];
                var skeletonRootNode: Loader.VisualSceneNode = Loader.VisualSceneNode.fromLink(skeletonLink, context);
                if (skeletonRootNode === null) {
                    context.log.write("Skeleton root node " + skeletonLink.getUrl() + " not found, skeleton root ignored", LogLevel.Warning);
                    continue;
                }
                skeletonRootNodes.push(skeletonRootNode);
            }

            if (skeletonRootNodes.length === 0) {
                context.log.write("Controller has no skeleton, using the whole scene as the skeleton root", LogLevel.Warning);
                skeletonRootNodes = context.nodes.collada.filter((node: Loader.VisualSceneNode) => (context.isInstanceOf(node.parent, "VisualScene")));
            }

            return skeletonRootNodes;
        }

        /**
        * Find the parent for each bone
        * The skeleton(s) may contain more bones than referenced by the skin
        * This function also adds all bones that are not referenced but used for the skeleton transformation
        */
        static addBoneParents(skeleton: Converter.Skeleton, context: Converter.Context): Converter.Skeleton {
            var bones = skeleton.bones.slice(0);

            var i: number = 0;
            // The bones array will grow during traversal, therefore the while loop
            while (i < bones.length) {
                // Select the next unprocessed bone
                var bone: Converter.Bone = bones[i];
                ++i;

                // Find a bone that corresponds to this bone's node parent
                for (var k: number = 0; k < bones.length; k++) {
                    var parentBone: Converter.Bone = bones[k];
                    if (bone.node.parent === parentBone.node) {
                        bone.parent = parentBone;
                        break;
                    }
                }

                // If no parent bone found, add it to the list
                if ((bone.node.parent != null) && (bone.parent == null)) {
                    bone.parent = Converter.Bone.create(bone.node.parent);
                    bones.push(bone.parent);
                }
            }

            var result = new Skeleton(bones);

            Skeleton.checkConsistency(result, context);
            return result;
        }

        /**
        * Given two arrays a and b, such that each bone from a is contained in b,
        * compute a map that maps the old index (a) of each bone to the new index (b).
        */
        static getBoneIndexMap(a: Converter.Skeleton, b: Converter.Skeleton): Uint32Array {
            var result: Uint32Array = new Uint32Array(a.bones.length);
            for (var i: number = 0; i < a.bones.length; ++i) {
                var bone_a: Converter.Bone = a.bones[i];

                // Find the index of the current bone in b
                var new_index: number = -1;
                for (var j: number = 0; j < b.bones.length; ++j) {
                    var bone_b: Converter.Bone = b.bones[j];
                    if (Converter.Bone.safeToMerge(bone_a, bone_b)) {
                        new_index = j;
                        break;
                    }
                }

                if (new_index < 0) {
                    var a_name: string = bone_a.name;
                    var b_names: string[] = b.bones.map((b: Converter.Bone) => b.name);
                    throw new Error("Bone " + a_name + " not found in " + b_names);
                }
                result[i] = new_index;
            }
            return result;
        }


        /**
        * Sorts bones so that child bones appear after their parents in the list.
        */
        static sortBones(skeleton: Converter.Skeleton, context: Context): Converter.Skeleton {
            var bones = skeleton.bones.slice(0);

            bones = bones.sort((a, b) => {
                // First, sort by depth
                var ad = a.depth();
                var bd = b.depth();
                if (ad !== bd) {
                    return ad - bd;
                }

                // Next, sort by previous position of parent
                if (a.parent !== b.parent && a.parent !== null) {
                    var ai = skeleton.bones.indexOf(a.parent);
                    var bi = skeleton.bones.indexOf(b.parent);
                    return ai - bi;
                }

                // Finally, sort by previous position of the bone
                var ai = skeleton.bones.indexOf(a);
                var bi = skeleton.bones.indexOf(b);
                return ai - bi;
            });

            if (bones.length != skeleton.bones.length || Skeleton.bonesSorted(bones) == false) {
                throw new Error("Error while sorting bones");
            }

            var result = new Skeleton(bones);

            Skeleton.checkConsistency(result, context);
            return result;
        }


        /**
        * Returns true if the bones are sorted so that child bones appear after their parents in the list.
        */
        static bonesSorted(bones: Converter.Bone[]): boolean {
            var errors: number = 0;
            bones.forEach((bone) => {
                if (bone.parent !== null) {
                    var boneIndex = bones.indexOf(bone);
                    var parentIndex = bones.indexOf(bone.parent);
                    if (boneIndex < parentIndex) {
                        ++errors;
                    }
                }
            });
            return errors === 0;
        }
    }