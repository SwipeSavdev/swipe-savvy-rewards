const { getDefaultConfig } = require('expo/metro-config');
const os = require('os');

const config = getDefaultConfig(__dirname);

// AGGRESSIVE Performance Optimizations for Metro Bundler
config.transformer = {
  ...config.transformer,
  experimentalImportSupport: true,
  experimentalEnableModulePathsNodeResolution: true,
  minifierConfig: {
    keep_classnames: false,
    keep_fnames: false,
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.info', 'console.debug', 'console.warn'],
      unused: true,
      dead_code: true,
      side_effects: false, // Enable aggressive tree-shaking
      passes: 2,
    },
    mangle: {
      toplevel: true, // More aggressive mangling
      keep_classnames: false,
      keep_fnames: false,
    },
    output: {
      comments: false,
    },
  },
  enableBabelRCLookup: false,
};

// Optimize resolver for faster module resolution
config.resolver = {
  ...config.resolver,
  sourceExts: ['tsx', 'ts', 'jsx', 'js', 'json'],
  assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ttf', 'otf', 'woff', 'woff2', 'svg'],
  blockList: [
    /\.git/,
  ],
};

// Parallel build optimization - use CPU cores
config.maxWorkers = Math.min(require('os').cpus().length, 8);

module.exports = config;
