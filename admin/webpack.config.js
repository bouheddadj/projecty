const webpack = require("webpack");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProduction = process.env.NODE_ENV === "production";

const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : "style-loader";

module.exports = () => {
  // Charge le fichier .env à la racine du projet
  const envFile = path.resolve(__dirname, ".env");

  let envVars = {};
  if (fs.existsSync(envFile)) {
    const env = dotenv.parse(fs.readFileSync(envFile));
    envVars = Object.keys(env).reduce((acc, key) => {
      acc[`process.env.${key}`] = JSON.stringify(env[key]);
      return acc;
    }, {});
  }

  const config = {
    mode: isProduction ? "production" : "development",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].bundle.js",
      clean: true,
    },
    devServer: {
      static: {
        directory: path.resolve(__dirname, "dist"),
      },
      open: true,
      host: "localhost",
      port: 8081,
    },
    entry: {
      main: "./src/index.ts", // pour admin.html
      login: "./src/login.ts", // pour index.html
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
      new webpack.DefinePlugin(envVars),
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

  if (isProduction) {
    config.plugins.push(new MiniCssExtractPlugin());
  }

  return config;
};
