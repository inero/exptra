// Suppress specific warnings
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('PlatformColor') ||
     message.includes('react-native-worklets') ||
     message.includes('Critical dependency'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('PlatformColor') ||
     message.includes('react-native-worklets'))
  ) {
    return;
  }
  originalError.apply(console, args);
};
