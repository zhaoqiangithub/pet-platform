// Jest setup file

// Mock __DEV__
global.__DEV__ = true;

// Polyfills for jsdom
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}
