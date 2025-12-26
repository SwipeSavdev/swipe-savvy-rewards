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

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  
  const MockIcon = (props) => {
    return React.createElement(Text, props, props.name || 'Icon');
  };
  
  return {
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    FontAwesome: MockIcon,
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
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
