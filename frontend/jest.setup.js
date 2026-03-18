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

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 39.9, longitude: 116.4 } })),
  reverseGeocodeAsync: jest.fn(() => Promise.resolve([{ region: '北京', city: '北京', district: '朝阳' }])),
  Accuracy: { High: 4 },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [{ uri: 'test://image.jpg' }] })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [{ uri: 'test://image.jpg' }] })),
  MediaTypeOptions: { Images: 'Images' },
}));
