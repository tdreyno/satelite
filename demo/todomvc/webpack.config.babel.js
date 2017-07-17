import path from "path";
import webpack from "webpack";
import { CheckerPlugin } from "awesome-typescript-loader";
import BabiliPlugin from "babili-webpack-plugin";
import LodashModuleReplacementPlugin from "lodash-webpack-plugin";

const NODE_MODULES_PATH = path.resolve(__dirname, "node_modules");
const ENV = process.env.NODE_ENV || "development";

module.exports = {
  devtool: "source-map",
  entry: ["./src/index"],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/static/",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: path.resolve(__dirname, "src"),
        loader: "source-map-loader",
        enforce: "pre",
      },
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader",
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new CheckerPlugin(),
    new webpack.DefinePlugin({
      "process.env": { NODE_ENV: JSON.stringify(process.env.NODE_ENV) },
    }),
    new LodashModuleReplacementPlugin({
      flattening: true,
      paths: true,
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ].concat(
    ENV === "production"
      ? [new webpack.optimize.OccurrenceOrderPlugin(), new BabiliPlugin()]
      : [],
  ),

  devServer: {
    contentBase: path.join(__dirname, "static"),
  },

  stats: { colors: true },
};
