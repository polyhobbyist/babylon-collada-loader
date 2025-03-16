const path = require("path");

/** @type WebpackConfig */
const webConfig = {
    entry: './src/daeViewer.ts',
    output: {
        path: path.resolve(__dirname, 'test'),
        filename: 'daeViewer.js',
        globalObject: 'this',
        library: {
            name: 'daeViewer',
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
    }
}

const libConfig = {
    entry: './src/dae.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'dae.js',
        globalObject: 'this',
        library: {
            name: 'dae_loader',
            type: 'umd'
        },
        umdNamedDefine: true
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
            root: 'BABYLON',
        },
    }
}

module.exports = [webConfig, libConfig]
