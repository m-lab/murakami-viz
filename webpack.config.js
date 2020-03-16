const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const commonLoaders = [
	{ test: [/\.js$/], loader: "jsx-loader" },
	{ test: [/\.png$/], loader: "url-loader" },
	{ test: [/\.jpg$/], loader: "file-loader" },
  { test: [/\.jsx$/], loader: "react-proxy-loader" },
  { test: [/\.m?js$/],
    exclude: /(node_modules|bower_components)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env']
      }
    }
  }
];
const assetsPath = path.join(__dirname, "dist", "assets");
const publicPath = "assets/";

module.exports = [
  {
    name: 'frontend',
    entry: './src/frontend/index.html',
    output: {
			path: assetsPath,
			filename: "[hash].js",
			publicPath: publicPath
		},
    module: {
			rules: commonLoaders.concat([
				{ test: /\.css$/, loader: "style-loader!css-loader" },
			])
		},
    plugins: [new HtmlWebpackPlugin()],
  },
  {
    name: 'backend',
    entry: './src/backend/index.js',
  },
  {
    name: 'worker',
    entry: './src/worker/index.js'
  }
];
