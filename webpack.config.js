const path = require('path')
const webpack = require('webpack')
const copyWebpackPlugin = require('copy-webpack-plugin')

module.exports = (() => {
  const babelLoader = {
    loader: 'babel-loader',
    options: {
      presets: ['env'],
      plugins: ['transform-decorators-legacy'],
      retainLines: true
    }
  }

  const javascript = {
    test: /\.js$/,
    include: [
      path.resolve(__dirname, './src/js')
    ],
    use: [babelLoader]
  }

  const config = {
    entry: './src/js/index.js',
    cache: true,
    module: {
      rules: [javascript]
    },
    output: {
      filename: 'dist/index.js'
    },
    plugins: [
      new copyWebpackPlugin([
                { from: path.resolve(__dirname, 'src/css/index.css'), to: path.resolve(__dirname, 'dist/css/index.css') },
                { from: path.resolve(__dirname, 'src/index.html'), to: path.resolve(__dirname, 'dist/index.html') }
      ])
    ],
    resolve: {
      modules: [
        path.join(__dirname, 'src'),
        'node_modules'
      ]
    },
    devtool: 'cheap-module-eval-source-map'
  }

  return config
})()
