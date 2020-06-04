const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    'pages/js/popup': './src/pages/js/popup.ts',
    'content/content': './src/content/content.ts',
    'background/background': './src/scripts/background.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    //拡張子を省略してトラブルを防ぐ。例：import hoge from './hoge/hoge.ts'の"ts"を省略できる
    extensions: [
      '.ts', '.js',
    ]
  },
  plugins: [
    // publicフォルダに、manifest.jsonやicon.pngを置いたので、
    // それが一緒に./distフォルダに吐き出されるようにする
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: './manifest.json' },
        { from: 'src/pages/index.html', to: './pages/index.html' },
      ],
    }),
  ],
}