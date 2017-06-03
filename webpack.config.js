const webpack = require("webpack");

module.exports = {
  context: __dirname + '/js',

  entry: {
    js: "./main.js"
  },

  output: {
    path: __dirname + '/dist',
    filename: "./bundle.js"
  },

	plugins: [
		new webpack.optimize.UglifyJsPlugin()
	],
}
