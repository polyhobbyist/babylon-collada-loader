import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "../loader/loader"
import * as Converter from "./converter"
import * as Utils from "./utils"
import * as MathUtils from "../math"
import * as BABYLON from 'babylonjs';

    export class Bone {
        node: Converter.Node;
        name: string;
        parent: Converter.Bone | undefined;
        invBindMatrix: BABYLON.Matrix = BABYLON.Matrix.Identity();
        attachedToSkin: boolean;

        constructor(node: Converter.Node) {
            this.node = node;
            this.name = node.name || "";
            this.attachedToSkin = false;
        }

        clone(): Bone {
            var result = new Bone(this.node);
            result.name = this.name;
            result.parent = this.parent;
            result.invBindMatrix = this.invBindMatrix.clone();
            result.attachedToSkin = this.attachedToSkin;
            return result;
        }

        depth(): number {
            return !this.parent ? 0 : (this.parent.depth() + 1);
        }

        static create(node: Converter.Node): Converter.Bone {
            return new Converter.Bone(node);
        }

        /**
        * Finds the visual scene node that is referenced by the joint SID.
        * The skin element contains the skeleton root nodes.
        */
        static findBoneNode(boneSid: string, skeletonRootNodes: Loader.VisualSceneNode[], context: Converter.ConverterContext): Loader.VisualSceneNode | undefined {
            // The spec is inconsistent here.
            // The joint ids do not seem to be real scoped identifiers(chapter 3.3, "COLLADA Target Addressing"), since they lack the first part (the anchor id)
            // The skin element(chapter 5, "skin" element) *implies* that the joint ids are scoped identifiers relative to the skeleton root node,
            // so perform a SID-like breadth-first search.
            var boneNode: Loader.EElement | undefined = undefined;
            var warnings: string[] = [];
            for (var i: number = 0; i < skeletonRootNodes.length; i++) {
                var skeletonRoot: Loader.VisualSceneNode = skeletonRootNodes[i];
                var sids: string[] = boneSid.split("/");
                var result = Loader.SidLink.findSidTarget(boneSid, skeletonRoot, sids, context);
                if (result.result != null) {
                    boneNode = result.result;
                    break;
                } else if (result.warning) {
                    warnings.push(result.warning);
                }
            }
            if (!boneNode) {
                context.log.write("Joint with SID " + boneSid + " not found, joint ignored. Related warnings:\n" + warnings.join("\n"), LogLevel.Warning);
                return undefined;
            } else if (context.isInstanceOf(boneNode, "VisualSceneNode")) {
                return <Loader.VisualSceneNode> boneNode;
            } else {
                context.log.write("Joint " + boneSid + " does not point to a visual scene node, joint ignored", LogLevel.Warning);
                return undefined;
            }
        }

        static sameInvBindMatrix(a: Converter.Bone, b: Converter.Bone, tolerance: number): boolean {
            if (!a || !b) {
                return false;
            }
            for (var i = 0; i < 16; ++i) {
                var ai = a.invBindMatrix.asArray()[i];
                var bi = b.invBindMatrix.asArray()[i];
                if (Math.abs(ai - bi) > tolerance) {
                    return false;
                }
            }
            return true;
        }


        /**
        * Returns true if the two bones can safely be merged, i.e.,
        * they reference the same scene graph node and have the same inverse bind matrix
        */
        static safeToMerge(a: Converter.Bone, b: Converter.Bone): boolean {
            if (a === b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            if (a.node !== b.node) {
                return false;
            }
            if (a.attachedToSkin && b.attachedToSkin && !Bone.sameInvBindMatrix(a, b, 1e-5)) {
                return false;
            }
            return true;
        }

        /**
        * Merges the two given bones. Returns null if they cannot be merged.
        */
        static mergeBone(a: Converter.Bone, b: Converter.Bone): Converter.Bone | undefined {
            if (!Bone.safeToMerge(a, b)) {
                return undefined;
            }
            if (a.attachedToSkin) {
                return a.clone();
            } else if (b.attachedToSkin) {
                return b.clone();
            } else {
                return a.clone();
            }
        }

    }
