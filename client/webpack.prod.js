const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.config.js');

module.exports = merge(common, {
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'build'),
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production'),
                'REACT_APP_API_BASE_URL': JSON.stringify('https://app.cybernack.com'), // Set production URL here
            },
        }),
    ],
});