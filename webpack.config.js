//@ts-check
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

// TODO: Tree shaking.
// TODO: Chunk splitting, avoid unnecessary download of monaco on each update.
// TODO: Provide production configuration.
// TODO: Provide CSS support.

/**
 * @type {import('webpack').Configuration & { devServer: import('webpack-dev-server').Configuration }}
 */
module.exports = {
    mode: 'development',
    entry: './src/main.ts',
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'LIKO-12 WebIDE'
        }),
        new MonacoWebpackPlugin({
            languages: ['lua', 'javascript', 'typescript'],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.ttf$/,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        clean: true,
    },
    optimization: {
        runtimeChunk: 'single',
    },
};