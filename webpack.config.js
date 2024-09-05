const path = require('path');

module.exports = {
  entry: {
    background: './src/background.js',
    sidebar: './src/sidebar.js',
    config: './src/config.js',
    content: './src/content.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    fallback: {
      "url": require.resolve("url/")
    }
  },
  optimization: {
    minimize: false
  }
};
