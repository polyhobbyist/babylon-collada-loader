const path = require("path");

module.exports = {
    entry: './src/dae.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'dae.js',
        globalObject: 'this',
        library: {
            name: 'dae_loader',
            type: 'umd'
        }
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        fallback: {
            // Webpack 5 no longer polyfills Node.js core modules automatically.
            // see https://webpack.js.org/configuration/resolve/#resolvefallback
            // for the list of Node.js core module polyfills.
            "stream": require.resolve("stream-browserify"),
            "timers": require.resolve("timers-browserify")
        }
    },
    devtool: 'source-map',
    plugins: [

    ],
    module: {
        rules: [{
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: [{
                loader: 'ts-loader',
            }]
    
        }]
    },
    externals: {
        babylonjs: {
            commonjs: 'babylonjs',
            commonjs2: 'babylonjs',
            amd: 'babylonjs',
            root: '_',
        },
    }
}