const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = (env, argv) => {
    const fully_assembl = env && env.F;
    const is_production = argv.mode === 'production';

    return {
        context: path.resolve(__dirname, './src'),
        entry: {
            build: './main.js'
        },
        output: {
            filename: '[name].bundle.js?[hash]',
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        hotReload: false // отключает горячую перезагрузку
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            //options: { modules: true }
                        }
                    ]
                },
                {
                    test: /\.(woff2|eot|ttf|otf|woff)$/,
                    loader: 'null-loader'
                },
                {
                    test: /\.pug$/,
                    oneOf: [
                        // это применяется к `<template lang="pug">` в компонентах Vue
                        {
                            resourceQuery: /^\?vue/,
                            use: ['pug-plain-loader']
                        },
                        // это применится для фалов с раширением .pug
                        {
                            use: [
                                {
                                    loader: 'file-loader',
                                    options: {
                                        name: '[name].html'
                                    }
                                },
                                'pug-plain-loader'
                            ]
                        }
                    ]
                },
                {
                    test: /\.(ttf|mp3|ico|png|jpg|gif|svg)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]?[hash]',
                        esModule: false
                    }
                },
            ],
        },

        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.resolve(__dirname, 'src/'),
                'utils': path.resolve(__dirname, 'src/utils.js'),
            }
        },

        plugins: [
            new HtmlWebpackPlugin({
                filename: 'index.html',
                inject: 'body',
                template: 'index.html'
            }),
            new VueLoaderPlugin(),
            new MiniCssExtractPlugin({
                filename: '[name].style.css?[hash]'
            }),
            new webpack.ProvidePlugin({
                'utils': 'utils'
            }),
        ]
    };
};