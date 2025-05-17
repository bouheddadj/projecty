const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProduction = process.env.NODE_ENV === "production";

const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : "style-loader";

module.exports = () => {
  return {
    mode: isProduction ? "production" : "development",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].bundle.js", // génère main.bundle.js
      clean: true, // supprime dist/ à chaque build
    },
    devServer: {
      static: {
        directory: path.resolve(__dirname, "dist"),
      },
      open: true,
      host: "localhost",
      port: 8080,
    },
    entry: {
      main: "./src/index.ts", // admin.html
      login: "./src/login.ts", // index.html
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "admin.html",
        template: "./src/admin.html",
        chunks: ["main"],
      }),
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: "./src/index.html",
        chunks: ["login"],
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/i,
          loader: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: [stylesHandler, "css-loader"],
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
          type: "asset",
        },
        {
          test: /\.html$/i,
          use: ["html-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
  };
};
