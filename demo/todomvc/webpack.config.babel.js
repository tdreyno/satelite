import path from "path";
import webpack from "webpack";
import { CheckerPlugin } from "awesome-typescript-loader";
import MinifyPlugin from "babel-minify-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

const NODE_MODULES_PATH = path.resolve(__dirname, "node_modules");
const ENV = process.env.NODE_ENV || "development";

module.exports = {
  devtool: "source-map",
  entry: {
    app: "./src/index",
    vendor: ["react", "react-dom"]
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
        test: /\.js$/,
        exclude: path.resolve(__dirname, "src"),
        loader: "source-map-loader",
        enforce: "pre"
      },
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader",
        exclude: /node_modules/
      }
    ]
  },

  plugins: [
    new CheckerPlugin(),
    new webpack.DefinePlugin({
      "process.env": { NODE_ENV: JSON.stringify(process.env.NODE_ENV) }
    }),
    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.bundle.js"
    })
  ].concat(
    ENV === "production"
      ? [
          new webpack.optimize.OccurrenceOrderPlugin(),
          new MinifyPlugin(),
          new CopyWebpackPlugin([
            {
              context: "static",
              from: "*"
            }
          ])
        ]
      : []
  ),

  devServer: {
    contentBase: path.join(__dirname, "static")
  },

  stats: { colors: true }
};
