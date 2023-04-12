import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "../loader/loader"
import * as Converter from "../converter/converter"
import * as Exporter from "./exporter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export class AnimationTrack {

        static toJSON(track: Converter.AnimationDataTrack, index: number, context: Exporter.Context): Exporter.AnimationTrackJSON {
            if (track === null) {
                return null;
            }

            var pos = Exporter.DataChunk.create(track.pos, 3, context);
            var rot = Exporter.DataChunk.create(track.rot, 4, context);
            var scl = Exporter.DataChunk.create(track.scl, 3, context);

            return {
                bone: index,
                pos: Exporter.DataChunk.toJSON(pos),
                rot: Exporter.DataChunk.toJSON(rot),
                scl: Exporter.DataChunk.toJSON(scl)
            };
        }
    }
