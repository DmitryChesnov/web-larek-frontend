const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { DefinePlugin } = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");
const Dotenv = require('dotenv-webpack');

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = MiniCssExtractPlugin.loader;

const config = {
  entry: "./src/index.ts",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: '/'
  },
  devServer: {
    open: true,
    host: "localhost",
    static: {
      directory: path.join(__dirname, 'public'),
    },
    historyApiFallback: true,
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/pages/index.html", // Сохраняем оригинальный путь
      filename: "index.html",
      inject: "body"
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css"
    }),
    new Dotenv({
      path: path.resolve(__dirname, '.env'),
      systemvars: true,
      safe: true,
      defaults: true
    }),
    new DefinePlugin({
      'process.env.API_ORIGIN': JSON.stringify(process.env.API_ORIGIN || 'https://larek-api.nomoreparties.co'),
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
    })
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              configFile: path.resolve(__dirname, 'tsconfig.json')
            }
          }
        ],
        exclude: ["/node_modules/"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          stylesHandler,
          {
            loader: "css-loader",
            options: {
              modules: false,
              sourceMap: true
            }
          },
          "postcss-loader",
          "resolve-url-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
              implementation: require('sass'),
              sassOptions: {
                includePaths: [path.resolve(__dirname, "src/scss")]
              }
            }
          }
        ],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader", "postcss-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif|ico)$/i,
        type: "asset/resource",
        generator: {
          filename: 'assets/[hash][ext][query]'
        }
      }
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: isProduction
          },
          keep_classnames: true,
          keep_fnames: true,
          format: {
            comments: false
          }
        },
        extractComments: false
      })
    ],
    splitChunks: {
      chunks: 'all'
    }
  }
};

module.exports = () => {
  config.mode = isProduction ? "production" : "development";
  return config;
};