const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const markupData = require('./src/markup/config.json')

const sassConfig = {
  fallback: "style-loader",
  use: [{
    loader: "css-loader",
    options: { url: false }
  }, {
    loader: "sass-loader"
  }, {
    loader: 'postcss-loader'
  }]

}

const config = {

  context: path.resolve(__dirname),
  entry: {
    'js/main.js': './src/js/index.js',
    'css/main.css': './src/sass/index.sass',
    
    //'index.html': './src/markup/index.ejs'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './[name]',
  },

  module: {
    rules: [
      {
        test: /\.txt$/i,
        use: 'raw-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /(\.sass|\.scss)$/,
        use: ExtractTextPlugin.extract(sassConfig)
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.ejs$/,
        use: [
          {
            loader: "ejs-webpack-loader",
            options: {
              data: markupData,
              htmlmin: true
            }
          }
        ]
      }
    ]
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 3000,   //Tell dev-server which port to run
    open: true,   // to open the local server in browser
    contentBase: path.resolve(__dirname, 'dist') //serve from 'dist' folder
  },
  plugins: [
    new CleanWebpackPlugin(['dist']), //cleans the dist folder
    new CopyWebpackPlugin([{ from: 'src/copy', to: '' }]), //copies things
    new ExtractTextPlugin('./[name]'), //exracts css
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, './dist/index.html'),
      inject: false,
      template: './src/markup/index.ejs'
    })
  ]
};

module.exports = config;