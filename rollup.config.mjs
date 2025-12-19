import dts from 'rollup-plugin-dts';

export default {
    input: './types/src/collada2gltf.d.ts',
    output: {
        file: 'dist/collada2gltf.d.ts',
        format: 'es'
    },
    plugins: [dts()]
};