const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');  // Ensure 'path' is imported
const common = require('./webpack.config.js'); // Main config file

module.exports = merge(common, {
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'build'),  // Output set to 'build' directory
        publicPath: '/',  // Ensures correct routing in production
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production'),
                'API_URI': JSON.stringify(process.env.CORS_ORIGIN || 'https://cybernack-platform.onrender.com'),  // Set API URL for Render
            },
        }),
    ],
});