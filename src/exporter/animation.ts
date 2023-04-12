import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "../loader/loader"
import * as Converter from "../converter/converter"
import * as Exporter from "./exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"
import {AnimationTrack} from "./animation_track"

    export class Animation {

        static toJSON(animation: Converter.AnimationData, context: Exporter.Context): Exporter.AnimationJSON {
            if (animation === null) {
                return {
                    name: "",
                    frames: 0,
                    fps: 0,
                    tracks: undefined
                }
            }

            return {
                name: animation.name,
                frames: animation.keyframes,
                fps: animation.fps,
                tracks: animation.tracks.map((e, i) => AnimationTrack.toJSON(e, i, context))
            };
        }
    }
