const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.[contenthash].js', // Include content hash for cache busting
    clean: true,
    publicPath: '/', // Ensure correct routing for React
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Include .jsx for React components if needed
    fallback: {
      process: require.resolve('process/browser'),
      path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Ensure React preset is included
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'statics/[name][ext]', // Consistent naming for assets
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: true, // Ensure script injection into the HTML template
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css', // Use content hash for cache busting
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'src/statics', to: 'statics' }],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  devServer: {
    static: path.resolve(__dirname, 'build'),
    port: 9000,
    historyApiFallback: true, // Support for client-side routing
    hot: true, // Enable Hot Module Replacement for better dev experience
    open: true, // Automatically open the browser on server start
  },
};