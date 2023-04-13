import {Context} from "../context"
import {LogLevel} from "../log"
import * as Loader from "../loader/loader"
import * as Converter from "./converter"
import * as Utils from "./utils"
import * as MathUtils from "../math"

    export interface AnimationTarget {
        applyAnimation(channel: Converter.AnimationChannel, time: number, context: Context): void;
        registerAnimation(channel: Converter.AnimationChannel): void;
        getTargetDataRows(): number;
        getTargetDataColumns(): number;
    }

    export class AnimationTimeStatistics {
        beginTime: Statistics;
        endTime: Statistics;
        duration: Statistics;
        keyframes: Statistics;
        fps: Statistics;

        constructor() {
            this.beginTime = new Statistics();
            this.endTime = new Statistics();
            this.duration = new Statistics();
            this.keyframes = new Statistics();
            this.fps = new Statistics();
        }

        addDataPoint(beginTime: number, endTime: number, keyframes: number) {
            var duration = endTime - beginTime;

            this.beginTime.addDataPoint(beginTime);
            this.endTime.addDataPoint(endTime);
            this.duration.addDataPoint(duration);
            this.keyframes.addDataPoint(keyframes);

            if (duration > 0) {
                var fps = (keyframes - 1) / duration;
                this.fps.addDataPoint(fps);
            }
        }
    }

    export class Statistics {
        data: number[];
        sorted: boolean;

        constructor() {
            this.data = [];
            this.sorted = true;
        }

        addDataPoint(value: number) {
            this.data.push(value);
            this.sorted = false;
        }

        private sort() {
            if (!this.sorted) {
                this.sorted = true;
                this.data = this.data.sort((a, b) => a - b);
            }
        }

        private compute(fn: (data:number[])=>number) {
            if (this.data.length > 0) {
                this.sort();
                return fn(this.data);
            } else {
                return null;
            }
        }

        count(): number {
            return this.compute((data) => data.length);
        }

        min(): number {
            return this.compute((data) => data[0]);
        }

        max(): number {
            return this.compute((data) => data[data.length - 1]);
        }

        median(): number {
            return this.compute((data) => {
                var m = (this.data.length - 1) / 2;
                var l = this.data[Math.floor(m)];
                var r = this.data[Math.ceil(m)];
                return (l + r) / 2;
            });
        }

        sum(): number {
            return this.compute((data) => data.reduce((prev, cur) => prev + cur, 0));
        }

        mean(): number {
            return this.compute((data) => this.sum() / this.count());
        }
    }

    export class Animation {
        id: string;
        name: string;
        channels: Converter.AnimationChannel[];

        constructor() {
            this.id = null;
            this.name = null;
            this.channels = [];
        }

        static create(animation: Loader.Animation, context: Converter.ConverterContext): Converter.Animation {
            var result: Converter.Animation = new Converter.Animation();
            result.id = animation.id;
            result.name = animation.name;

            Converter.Animation.addChannelsToAnimation(animation, result, context);

            return result;
        }

        static addChannelsToAnimation(collada_animation: Loader.Animation, converter_animation: Converter.Animation, context: Converter.ConverterContext) {
            // Channels
            for (var i: number = 0; i < collada_animation.channels.length; ++i) {
                var channel: Converter.AnimationChannel = Converter.AnimationChannel.create(collada_animation.channels[i], context);
                converter_animation.channels.push(channel);
            }

            // Children
            for (var i: number = 0; i < collada_animation.children.length; ++i) {
                var child: Loader.Animation = collada_animation.children[i];
                Converter.Animation.addChannelsToAnimation(child, converter_animation, context);
            }
        }

        /**
        * Returns the time and fps statistics of this animation
        */
        static getTimeStatistics(animation: Converter.Animation, index_begin: number, index_end: number, result: Converter.AnimationTimeStatistics, context: Converter.ConverterContext) {
            // Channels
            for (var i: number = 0; i < animation.channels.length; ++i) {
                var channel: Converter.AnimationChannel = animation.channels[i];

                if (channel) {
                    var begin = (index_begin !== null) ? index_begin : -Infinity;
                    begin = Math.min(Math.max(begin, 0), channel.input.length - 1);
                    var end = (index_end !== null) ? index_end : Infinity;
                    end = Math.min(Math.max(end, 0), channel.input.length - 1);

                    var channelMinTime: number = channel.input[begin];
                    var channelMaxTime: number = channel.input[end];
                    var channelKeyframes: number = end - begin + 1;

                    result.addDataPoint(channelMinTime, channelMaxTime, channelKeyframes);
                }
            }
        }
    }
