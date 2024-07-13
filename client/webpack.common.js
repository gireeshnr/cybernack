const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        app: './src/app.js',
        vendor: [
            'react', 'react-dom', 'redux',
            'react-redux', 'react-router-dom',
            'axios', 'prop-types'
        ]
    },
    output: {
        path: path.resolve(__dirname, '../docs/'),
        filename: "js/[name].[chunkhash].js"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.s?css$/,
                exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'src/index.html') }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('development'),
                'API_URI': JSON.stringify('http://localhost:8000')
            }
        }),
        new MiniCssExtractPlugin({
            filename: 'styles/style.css'
        })
    ]
}
