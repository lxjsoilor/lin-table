const merge = require('webpack-merge'),
    common = require('./webpack.base'),
    path = require('path'),
    // 清除dist文件夹
    {CleanWebpackPlugin} = require('clean-webpack-plugin'),
    // 处理、打包css文件 功能类似style-loader
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    // 用于压缩css文件
    OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin"),
    // 压缩js文件
    UglifyJsPlugin = require("uglifyjs-webpack-plugin");

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}
module.exports = merge(common, {
    mode: 'production',
    output: {
        filename: 'v-table-common.js',
        path: resolve('lib'),
        chunkFilename: path.posix.join(__dirname, '../lib/js/[id].js')
    },
    optimization: {
        // 将引入的第三方库文件单独打包
        splitChunks: {
            // 所有引入的文件都打包
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    name: 'vendor',
                    test: /[\\/]node_module[\\/]/,
                    priority: -10,
                    chunks: 'initial'
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        // 使用MiniCssExtractPlugin.loader替代style-loader
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            // 解决图片路径不对的问题
                            publicPath: '../'
                        }
                    },
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash:5].css'
        }),
        new OptimizeCSSAssetsPlugin(),
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    // 去除debugger和console
                    drop_debugger: true,
                    drop_console: true
                }
            },
            cache: true,
            parallel: true,
            sourceMap: false
        })
    ]
});