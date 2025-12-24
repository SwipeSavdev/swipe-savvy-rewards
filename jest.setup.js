import '@testing-library/jest-native/extend-expect';

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
  responseText = '';
  status = 200;
  onprogress = null;
  onload = null;
  onerror = null;
  
  open() {}
  setRequestHeader() {}
  send() {}
  abort() {}
}

global.XMLHttpRequest = MockXMLHttpRequest as any;
