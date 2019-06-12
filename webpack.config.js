const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'development',
  entry: {
    main: './src/main.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  target: 'node',
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      options: {
        presets: [
          [
            '@babel/preset-env', {
              targets: {
                node: 'current'
              },
              modules: 'false'
            }
          ]
        ]
      },
      exclude: ['/node_modules']

    }, {
      test: /\.json$/,
      loader: 'json-loader',
      exclude: ['/node_modules']
    }]
  },
  externals: [nodeExternals()],
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.json', '.jsx', '.css']
  }
}
