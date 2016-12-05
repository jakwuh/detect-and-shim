var path = require('path');

module.exports = {
    target: 'node',

    entry: {
        main: ['./test/index']
    },

    resolve: {
        extensions: ['', '.js'],
        root: [
            path.resolve(__dirname, './node_modules'),
            path.resolve(__dirname, './src')
        ]
    },

    output: {
        path: path.join(__dirname, './dist'),
        filename: '[name].bundle.js'
    },

    stats: {
        hash: true,
        timings: true,
        chunks: true,
        chunkModules: true,
        modules: true,
        children: true,
        version: true,
        cached: true,
        assets: true,
        cachedAssets: true,
        reasons: true,
        source: false,
        errorDetails: true
    }
};
