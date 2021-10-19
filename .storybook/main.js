const path = require('path');
const babelConfig = require('../babel.config');
const babelOptions = babelConfig();

const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  stories: ['../ui/**/*.stories.js'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-actions',
    '@storybook/addon-a11y',
    '@storybook/addon-knobs',
    './i18n-party-addon/register.js',
  ],
  babel: async (options) => ({
    ...options,
    ...babelOptions,
  }),
  webpackFinal: async (config) => {
    config.context = process.cwd();
    config.node = {
      __filename: true,
    };
    config.module.strictExportPresence = true;
    config.module.rules.push({
      test: /\.scss$/,
      loaders: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            import: false,
            url: false,
          },
        },
        'resolve-url-loader',
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
            implementation: require('sass'),
            sassOptions: {
              includePaths: ['ui/css/'],
            },
          },
        },
      ],
    });
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(
              'node_modules',
              '@fortawesome',
              'fontawesome-free',
              'webfonts',
            ),
            to: path.join('fonts', 'fontawesome'),
          },
        ],
      }),
    );
    return config;
  },
};
