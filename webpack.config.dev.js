const path = require('path');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
const webpack = require('webpack');
const HappyPack = require('happypack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    app: './src/index.ts',
  },
  devtool: 'cheap-inline-module-source-map', // for correct stack line number
  target: 'node',
  watch: true,
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'happypack/loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  optimization: {
    namedModules: true,
    noEmitOnErrors: true,
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    sourceMapFilename: '[name].js.map',
  },
  plugins: [
    new webpack.WatchIgnorePlugin([path.resolve('reservations.json')]),
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),
    new NodemonPlugin({
      nodeArgs: ['-r', 'dotenv/config', '--inspect=0.0.0.0:9229'],
      ext: 'js,json',
      watch: path.resolve(__dirname, 'dist'),
      script: path.resolve(__dirname, 'dist/app.js'),
    }),
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
    new HappyPack({
      loaders: [
        {
          loader: 'ts-loader',
          options: {
            happyPackMode: true,
          },
        },
      ],
      threads: 1,
    }),
  ],
};
