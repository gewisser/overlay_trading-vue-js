const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = (env, argv) => {
    return merge(common(env, argv), {
        mode: 'production',
        output: {
            path: path.resolve(__dirname, './prod')
        },

        devServer: {
            contentBase: path.join(__dirname, './prod'),
            compress: true,
            port: 8080
        },

        devtool: false,

        performance: { hints: false },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: false // set to true if you want JS source maps
                }),
                new OptimizeCSSAssetsPlugin({})
            ]
        }
    })
};
