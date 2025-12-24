require('@testing-library/jest-native/extend-expect');

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      MOCK_API: 'false',
      AI_API_BASE_URL: 'http://localhost:8000',
      DEBUG_MODE: 'true',
    },
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup fetch mock
global.fetch = jest.fn();

// Setup XMLHttpRequest mock
class MockXMLHttpRequest {
  constructor() {
    this.responseText = '';
    this.status = 200;
    this.readyState = 0;
    this.onprogress = null;
    this.onload = null;
    this.onerror = null;
  }
  
  open() {}
  setRequestHeader() {}
  send() {}
  abort() {}
}

global.XMLHttpRequest = MockXMLHttpRequest;
