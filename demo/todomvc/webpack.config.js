const { CheckerPlugin } = require("awesome-typescript-loader");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: {
    app: "./src/index"
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/"
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"]
  },
  module: {
    rules: [
      {
        test: /\.(jsx)$/,
        exclude: /(node_modules)/,
        loader: "babel-loader"
      },
      {
        test: /\.(ts|tsx)$/,
        use: require.resolve("awesome-typescript-loader")
      }
    ]
  },

  devServer: {
    contentBase: path.join(__dirname, "static")
  },

  stats: { colors: true }
};
