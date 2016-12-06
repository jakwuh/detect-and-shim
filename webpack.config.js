const path = require('path');

module.exports = {
    target: 'node',

    externals: {
        'chai': 'commonjs chai',
        'chai-as-promised': 'commonjs chai-as-promised'
    },

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

    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            include: [
                path.join(__dirname, './src'),
                path.join(__dirname, './test')
            ]
        }]
    },

    output: {
        path: path.join(__dirname, './dist'),
        filename: '[name].js',
        chunkFilename: '[name].js'
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
