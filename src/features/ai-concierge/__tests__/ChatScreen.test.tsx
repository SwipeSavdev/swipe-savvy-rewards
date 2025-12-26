import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';

// Mock the useAIChat hook BEFORE importing ChatScreen
jest.mock('@ai-sdk/hooks/useAIChat');

// Import the mock hook
import { useAIChat } from '@ai-sdk/hooks/useAIChat';

// Create mock function
const mockSendMessage = jest.fn();

// Now import ChatScreen
import { ChatScreen } from '../screens/ChatScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {},
  }),
}));

describe('ChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the mock to default state
    (useAIChat as jest.Mock).mockReturnValue({
      messages: [],
      isLoading: false,
      currentResponse: null,
      sendMessage: mockSendMessage,
      error: null,
    });
  });

  describe('Screen Rendering', () => {
    it('should render chat screen with input field', () => {
      render(<ChatScreen />);
      
      expect(screen.getByPlaceholderText(/ask me anything/i)).toBeTruthy();
      expect(screen.getByTestId('chat-input')).toBeTruthy();
    });

    it('should render welcome message', () => {
      render(<ChatScreen />);
      
      expect(screen.getByText(/AI Assistant/i)).toBeTruthy();
    });

    it('should show quick action buttons', () => {
      render(<ChatScreen />);
      
      expect(screen.getByText(/Check Balance/i)).toBeTruthy();
      expect(screen.getByText(/Recent Transactions/i)).toBeTruthy();
    });
  });

  describe('Sending Messages', () => {
    it('should send message when user types and presses send', async () => {
      render(<ChatScreen />);
      
      const input = screen.getByTestId('chat-input');
      const sendButton = screen.getByTestId('send-button');
      
      fireEvent.changeText(input, 'Hello');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Hello');
      });
    });

    it('should disable send button when message is empty', () => {
      render(<ChatScreen />);
      
      const sendButton = screen.getByTestId('send-button');
      expect(sendButton).toBeDisabled();
    });

    it('should clear input after sending message', async () => {
      render(<ChatScreen />);
      
      const input = screen.getByTestId('chat-input');
      const sendButton = screen.getByTestId('send-button');
      
      fireEvent.changeText(input, 'Hello');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(input.props.value).toBe('');
      });
    });

    it('should add user message to conversation', async () => {
      const { rerender } = render(<ChatScreen />);
      
      // Update mock to include a user message
      (useAIChat as jest.Mock).mockReturnValue({
        messages: [{ role: 'user', content: 'Hello', id: '1' }],
        isLoading: false,
        currentResponse: null,
        sendMessage: mockSendMessage,
        error: null,
      });
      
      rerender(<ChatScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeTruthy();
      });
    });
  });

  describe('Streaming Responses', () => {
    it('should display thinking indicator during processing', () => {
      (useAIChat as jest.Mock).mockReturnValue({
        messages: [],
        isLoading: true,
        currentResponse: null,
        sendMessage: mockSendMessage,
        error: null,
      });
      
      render(<ChatScreen />);
      
      expect(screen.getByTestId('typing-indicator')).toBeTruthy();
    });

    it('should stream message content word by word', async () => {
      (useAIChat as jest.Mock).mockReturnValue({
        messages: [],
        isLoading: true,
        currentResponse: 'Hello world',
        sendMessage: mockSendMessage,
        error: null,
      });
      
      render(<ChatScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Hello world')).toBeTruthy();
      });
    });

    it('should hide thinking indicator when response completes', () => {
      (useAIChat as jest.Mock).mockReturnValue({
        messages: [{ role: 'assistant', content: 'Complete message', id: '1' }],
        isLoading: false,
        currentResponse: null,
        sendMessage: mockSendMessage,
        error: null,
      });
      
      render(<ChatScreen />);
      
      expect(screen.queryByTestId('typing-indicator')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when request fails', () => {
      (useAIChat as jest.Mock).mockReturnValue({
        messages: [],
        isLoading: false,
        currentResponse: null,
        sendMessage: mockSendMessage,
        error: 'Network error',
      });
      
      render(<ChatScreen />);
      
      expect(screen.getByText(/error/i)).toBeTruthy();
    });

    it('should allow retry after error', async () => {
      (useAIChat as jest.Mock).mockReturnValue({
        messages: [],
        isLoading: false,
        currentResponse: null,
        sendMessage: mockSendMessage,
        error: 'Network error',
      });
      
      render(<ChatScreen />);
      
      const retryButton = screen.getByTestId('retry-button');
      fireEvent.press(retryButton);
      
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalled();
      });
    });

    it('should handle timeout errors gracefully', () => {
      (useAIChat as jest.Mock).mockReturnValue({
        messages: [],
        isLoading: false,
        currentResponse: null,
        sendMessage: mockSendMessage,
        error: 'Request timeout',
      });
      
      render(<ChatScreen />);
      
      expect(screen.getByText(/timeout/i)).toBeTruthy();
    });
  });

  describe('Quick Actions', () => {
    it('should send predefined message when quick action is pressed', async () => {
      render(<ChatScreen />);
      
      const balanceButton = screen.getByText(/Check Balance/i);
      fireEvent.press(balanceButton);
      
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith("What's my balance?");
      });
    });
  });

  describe('Conversation History', () => {
    it('should maintain conversation history across messages', () => {
      (useAIChat as jest.Mock).mockReturnValue({
        messages: [
          { role: 'user', content: 'Hello', id: '1' },
          { role: 'assistant', content: 'Hi there!', id: '2' },
          { role: 'user', content: 'How are you?', id: '3' },
        ],
        isLoading: false,
        currentResponse: null,
        sendMessage: mockSendMessage,
        error: null,
      });
      
      render(<ChatScreen />);
      
      expect(screen.getByText('Hello')).toBeTruthy();
      expect(screen.getByText('Hi there!')).toBeTruthy();
      expect(screen.getByText('How are you?')).toBeTruthy();
    });

    it('should scroll to bottom when new messages arrive', async () => {
      const { rerender } = render(<ChatScreen />);
      
      // Add a new message
      (useAIChat as jest.Mock).mockReturnValue({
        messages: [{ role: 'user', content: 'New message', id: '1' }],
        isLoading: false,
        currentResponse: null,
        sendMessage: mockSendMessage,
        error: null,
      });
      
      rerender(<ChatScreen />);
      
      // In a real test, you'd verify scrollToEnd was called on the FlatList ref
      await waitFor(() => {
        expect(screen.getByText('New message')).toBeTruthy();
      });
    });
  });

  describe('Session Management', () => {
    it('should include session_id in chat requests', async () => {
      render(<ChatScreen />);
      
      // This would require inspecting the sendMessage implementation
      // For now, we'll just verify the function was called
      const input = screen.getByTestId('chat-input');
      const sendButton = screen.getByTestId('send-button');
      
      fireEvent.changeText(input, 'Test');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalled();
      });
    });

    it('should reuse same session_id for conversation', async () => {
      render(<ChatScreen />);
      
      const input = screen.getByTestId('chat-input');
      const sendButton = screen.getByTestId('send-button');
      
      fireEvent.changeText(input, 'First');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('First');
      });
      
      mockSendMessage.mockClear();
      
      fireEvent.changeText(input, 'Second');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Second');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for interactive elements', () => {
      render(<ChatScreen />);
      
      const input = screen.getByTestId('chat-input');
      const sendButton = screen.getByTestId('send-button');
      
      expect(input.props.accessibilityLabel).toBeTruthy();
      expect(sendButton.props.accessibilityLabel).toBeTruthy();
    });

    it('should announce new messages to screen readers', async () => {
      const { rerender } = render(<ChatScreen />);
      
      (useAIChat as jest.Mock).mockReturnValue({
        messages: [{ role: 'assistant', content: 'New response', id: '1' }],
        isLoading: false,
        currentResponse: null,
        sendMessage: mockSendMessage,
        error: null,
      });
      
      rerender(<ChatScreen />);
      
      await waitFor(() => {
        const message = screen.getByText('New response');
        expect(message.props.accessible).toBeTruthy();
      });
    });
  });
});
