const webpack = require("webpack");

module.exports = {
  context: __dirname + '/public/js',

  entry: {
    js: "./main.js"
  },

  output: {
    path: __dirname + '/public/dist',
    filename: "./bundle.js"
  },

	plugins: [
		new webpack.optimize.UglifyJsPlugin()
	],
}
