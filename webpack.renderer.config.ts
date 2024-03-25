import type { Configuration } from "webpack";

import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

const path = require("path");

rules.push({
  test: /\.css$/,
  use: [
    { loader: "style-loader" },
    { loader: "css-loader" },
    { loader: "postcss-loader" },
  ],
});

rules.push({
  test: /\.(png|jpg|svg|jpeg|gif)$/i,
  use: {
    loader: "file-loader",
  },
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  target: "electron-renderer",
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
