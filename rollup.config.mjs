import dts from 'rollup-plugin-dts';

export default {
    input: './types/src/dae.d.ts',
    output: {
        file: 'dist/dae.d.ts',
        format: 'es'
    },
    plugins: [dts()]
};