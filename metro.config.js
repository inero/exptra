const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Suppress warnings
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
