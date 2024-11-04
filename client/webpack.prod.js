const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');  // Add this line to import 'path'
const common = require('./webpack.config.js'); // Ensure this points to your main config file

module.exports = merge(common, {
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'build'),  // Ensure the output is set to 'build' directory
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production'),
                'API_URI': JSON.stringify(process.env.PROD_APP_URL || 'https://cybernack-platform.onrender.com'),  // Set API URL for Render
            },
        }),
    ],
});