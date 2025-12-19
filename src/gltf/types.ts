/**
 * glTF 2.0 Type Definitions
 * Based on the official glTF 2.0 specification
 */

export namespace GLTF2 {
    export interface IGLTF {
        asset: IAsset;
        scene?: number;
        scenes?: IScene[];
        nodes?: INode[];
        meshes?: IMesh[];
        materials?: IMaterial[];
        accessors?: IAccessor[];
        bufferViews?: IBufferView[];
        buffers?: IBuffer[];
        images?: IImage[];
        textures?: ITexture[];
        samplers?: ISampler[];
        skins?: ISkin[];
        animations?: IAnimation[];
        cameras?: ICamera[];
        extensionsUsed?: string[];
        extensionsRequired?: string[];
        extensions?: any;
        extras?: any;
    }

    export interface IAsset {
        version: string;
        generator?: string;
        copyright?: string;
        minVersion?: string;
    }

    export interface IScene {
        nodes?: number[];
        name?: string;
        extensions?: any;
        extras?: any;
    }

    export interface INode {
        name?: string;
        mesh?: number;
        skin?: number;
        camera?: number;
        children?: number[];
        matrix?: number[]; // 16 elements
        translation?: number[]; // 3 elements
        rotation?: number[]; // 4 elements (quaternion)
        scale?: number[]; // 3 elements
        weights?: number[];
        extensions?: any;
        extras?: any;
    }

    export interface IMesh {
        name?: string;
        primitives: IMeshPrimitive[];
        weights?: number[];
        extensions?: any;
        extras?: any;
    }

    export interface IMeshPrimitive {
        attributes: { [name: string]: number };
        indices?: number;
        material?: number;
        mode?: number; // 0-6, default 4 (TRIANGLES)
        targets?: { [name: string]: number }[];
        extensions?: any;
        extras?: any;
    }

    export interface IMaterial {
        name?: string;
        pbrMetallicRoughness?: IPBRMetallicRoughness;
        normalTexture?: INormalTextureInfo;
        occlusionTexture?: IOcclusionTextureInfo;
        emissiveTexture?: ITextureInfo;
        emissiveFactor?: number[]; // 3 elements
        alphaMode?: "OPAQUE" | "MASK" | "BLEND";
        alphaCutoff?: number;
        doubleSided?: boolean;
        extensions?: any;
        extras?: any;
    }

    export interface IPBRMetallicRoughness {
        baseColorFactor?: number[]; // 4 elements
        baseColorTexture?: ITextureInfo;
        metallicFactor?: number;
        roughnessFactor?: number;
        metallicRoughnessTexture?: ITextureInfo;
        extensions?: any;
        extras?: any;
    }

    export interface ITextureInfo {
        index: number;
        texCoord?: number;
        extensions?: any;
        extras?: any;
    }

    export interface INormalTextureInfo extends ITextureInfo {
        scale?: number;
    }

    export interface IOcclusionTextureInfo extends ITextureInfo {
        strength?: number;
    }

    export interface ITexture {
        sampler?: number;
        source?: number;
        name?: string;
        extensions?: any;
        extras?: any;
    }

    export interface IImage {
        uri?: string;
        mimeType?: "image/jpeg" | "image/png";
        bufferView?: number;
        name?: string;
        extensions?: any;
        extras?: any;
    }

    export interface ISampler {
        magFilter?: number; // 9728, 9729
        minFilter?: number; // 9728, 9729, 9984, 9985, 9986, 9987
        wrapS?: number; // 33071, 33648, 10497
        wrapT?: number; // 33071, 33648, 10497
        name?: string;
        extensions?: any;
        extras?: any;
    }

    export interface IAccessor {
        bufferView?: number;
        byteOffset?: number;
        componentType: number; // 5120-5126
        normalized?: boolean;
        count: number;
        type: "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4";
        max?: number[];
        min?: number[];
        sparse?: IAccessorSparse;
        name?: string;
        extensions?: any;
        extras?: any;
    }

    export interface IAccessorSparse {
        count: number;
        indices: IAccessorSparseIndices;
        values: IAccessorSparseValues;
        extensions?: any;
        extras?: any;
    }

    export interface IAccessorSparseIndices {
        bufferView: number;
        byteOffset?: number;
        componentType: number;
        extensions?: any;
        extras?: any;
    }

    export interface IAccessorSparseValues {
        bufferView: number;
        byteOffset?: number;
        extensions?: any;
        extras?: any;
    }

    export interface IBufferView {
        buffer: number;
        byteOffset?: number;
        byteLength: number;
        byteStride?: number;
        target?: number; // 34962, 34963
        name?: string;
        extensions?: any;
        extras?: any;
    }

    export interface IBuffer {
        uri?: string;
        byteLength: number;
        name?: string;
        extensions?: any;
        extras?: any;
    }

    export interface ISkin {
        inverseBindMatrices?: number;
        skeleton?: number;
        joints: number[];
        name?: string;
        extensions?: any;
        extras?: any;
    }

    export interface IAnimation {
        channels: IAnimationChannel[];
        samplers: IAnimationSampler[];
        name?: string;
        extensions?: any;
        extras?: any;
    }

    export interface IAnimationChannel {
        sampler: number;
        target: IAnimationChannelTarget;
        extensions?: any;
        extras?: any;
    }

    export interface IAnimationChannelTarget {
        node?: number;
        path: "translation" | "rotation" | "scale" | "weights";
        extensions?: any;
        extras?: any;
    }

    export interface IAnimationSampler {
        input: number;
        interpolation?: "LINEAR" | "STEP" | "CUBICSPLINE";
        output: number;
        extensions?: any;
        extras?: any;
    }

    export interface ICamera {
        type: "perspective" | "orthographic";
        perspective?: ICameraPerspective;
        orthographic?: ICameraOrthographic;
        name?: string;
        extensions?: any;
        extras?: any;
    }

    export interface ICameraPerspective {
        aspectRatio?: number;
        yfov: number;
        zfar?: number;
        znear: number;
        extensions?: any;
        extras?: any;
    }

    export interface ICameraOrthographic {
        xmag: number;
        ymag: number;
        zfar: number;
        znear: number;
        extensions?: any;
        extras?: any;
    }
}
