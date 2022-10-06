const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  stories: ['../**/*.stories.mdx', '../**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-addon-next',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss')
        }
      }
    }
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5'
  },
  staticDirs: ['../public', '../assets'],
  previewHead: (head) => `
    ${head}
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Inter&family=Sora&display=swap");
      body,
      button,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      html,
      li,
      p,
      div,
      input {
        font-family: 'Inter', sans-serif !important;
        font-style: normal;
      }
    </style>
  `,
  webpackFinal: async (config, { configType }) => {
    config.resolve.plugins = [new TsconfigPathsPlugin()];
    return config;
  }
};
