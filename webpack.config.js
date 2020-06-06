const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    'pages/js/popup': `${__dirname}/src/pages/js/popup.ts`,
    'content/content': `${__dirname}/src/content/content.ts`,
    'scripts/background': `${__dirname}/src/scripts/background.ts`
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
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: './manifest.json' },
        { from: 'src/pages/style', to: './pages/style' },
        { from: 'src/images', to: './images' },
        { from: 'src/pages/popup.html', to: './pages/popup.html' },
      ],
    }),
  ],
}