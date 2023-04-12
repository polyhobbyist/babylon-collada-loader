import * as Converter from "../converter/converter"

export class Document {
        /** The scene graph */
        nodes: Converter.Node[];
        /** Animations (all original animation curves) */
        animations: Converter.Animation[];
        /** Animations (resampled node animations) */
        resampled_animations: Converter.AnimationData[];
        /** Geometries (detached from the scene graph) */
        geometries: Converter.Geometry[];

        constructor() {
            this.nodes = [];
            this.animations = [];
            this.geometries = [];
            this.resampled_animations = [];
        }
    }
