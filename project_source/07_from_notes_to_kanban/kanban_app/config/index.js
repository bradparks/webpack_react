'use strict';
var path = require('path');
var webpack = require('webpack');
var merge = require('./merge');

var ROOT_PATH = path.resolve(__dirname, '..');

var common = {
  entry: [path.join(ROOT_PATH, 'app/main.jsx')],
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
      }
    ]
  },
};

var mergeConfig = merge.bind(null, common);

exports.build = mergeConfig({
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: path.join(ROOT_PATH, 'app'),
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        // This has effect on the react lib size
        'NODE_ENV': JSON.stringify('production'),
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
    }),
  ],
});

exports.develop = mergeConfig({
  entry: ['webpack/hot/dev-server'],
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loader: 'eslint',
        include: path.join(ROOT_PATH, 'app'),
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        // XXXXX: flowcheck doesn't work with decorators yet
        loaders: ['react-hot', 'babel?stage=0'], //'flowcheck'],
        include: path.join(ROOT_PATH, 'app'),
      }
    ]
  },
  plugins: [
    // do not reload if there is a syntax error in your code
    new webpack.NoErrorsPlugin()
  ],
});
