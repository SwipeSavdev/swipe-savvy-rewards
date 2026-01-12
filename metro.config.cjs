const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Path aliases mapping
const projectRoot = __dirname;
const srcPath = path.resolve(projectRoot, 'src');

// Minimal transformer config
config.transformer = {
  ...config.transformer,
  experimentalImportSupport: true,
  experimentalEnableModulePathsNodeResolution: true,
  enableBabelRCLookup: false,
};

// Optimize resolver
config.resolver = {
  ...config.resolver,
  // Add .web.ts extension priority for web builds and .cjs for nanoid compatibility
  sourceExts: ['web.tsx', 'web.ts', 'tsx', 'ts', 'web.jsx', 'web.js', 'jsx', 'js', 'json', 'cjs', 'mjs'],
  assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ttf', 'otf', 'woff', 'woff2', 'svg'],
  blockList: [
    /\.git/,
    // Block native-only modules from web builds
    /node_modules\/expo-sqlite\/web\/wa-sqlite/,
  ],
  extraNodeModules: {
    '@contexts': path.resolve(srcPath, 'contexts'),
    '@features': path.resolve(srcPath, 'features'),
    '@components': path.resolve(srcPath, 'components'),
    '@hooks': path.resolve(srcPath, 'hooks'),
    '@utils': path.resolve(srcPath, 'utils'),
    '@constants': path.resolve(srcPath, 'constants'),
    '@types': path.resolve(srcPath, 'types'),
    '@assets': path.resolve(srcPath, 'assets'),
    '@api': path.resolve(srcPath, 'api'),
    '@styles': path.resolve(srcPath, 'styles'),
    '@database': path.resolve(srcPath, 'database'),
    '@packages': path.resolve(srcPath, 'packages'),
    '@ai-sdk': path.resolve(srcPath, 'packages/ai-sdk/src'),
  },
};

module.exports = config;
