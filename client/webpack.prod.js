const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.config.js');

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.[contenthash].js', // Include content hash for cache busting
    publicPath: '/', // Ensure assets are correctly served in production
  },
  optimization: {
    splitChunks: {
      chunks: 'all', // Enable code splitting for better performance
    },
    runtimeChunk: 'single', // Separate runtime code into its own file
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.REACT_APP_API_BASE_URL': JSON.stringify('https://app.cybernack.com'), // Set production API base URL
    }),
  ],
});