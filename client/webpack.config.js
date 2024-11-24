const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js', // Helps with code splitting
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      process: require.resolve('process/browser'),
      path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer/'),
    },
  },
  devtool: 'source-map', // Enables source maps
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'statics/[name][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: true,
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'src/statics', to: 'statics' }],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProgressPlugin({
      handler: (percentage, message, ...args) => {
        console.log(`${(percentage * 100).toFixed(2)}%: ${message}`, ...args);
      },
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.NODE_ENV === 'production' ? 'disabled' : 'static',
      reportFilename: 'report.html',
      openAnalyzer: process.env.NODE_ENV !== 'production',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    minimize: true,
    minimizer: [`...`], // Default TerserPlugin configuration
  },
  stats: {
    assets: true,
    modules: true,
    errors: true,
    warnings: true,
    errorDetails: true,
    colors: true,
    reasons: true,
  },
  devServer: {
    static: path.resolve(__dirname, 'build'),
    port: 9000,
    historyApiFallback: true,
    hot: true,
    open: process.env.AUTO_OPEN === 'true',
  },
};