// Mock implementation of useAIChat hook for testing
export const mockSendMessage = jest.fn();

export const useAIChat = jest.fn(() => ({
  messages: [],
  isLoading: false,
  currentResponse: null,
  sendMessage: mockSendMessage,
  error: null,
}));
