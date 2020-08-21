const webpack = require('webpack'),
    path = require('path'),
    // 用于解析vue文件
    VueLoaderPlugin = require('vue-loader/lib/plugin');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}
module.exports = {
    entry: './src/index.js', // 项目的入口文件
    module: {
      rules:[
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
              'style-loader',
              'css-loader',
              'postcss-loader',
              'sass-loader'
          ]
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin()
    ]
}
