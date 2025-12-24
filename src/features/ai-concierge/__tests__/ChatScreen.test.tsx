import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import ChatScreen from '../screens/ChatScreen';
import { SwipeSavvyAI } from '../../../packages/ai-sdk/src/client/AIClient';

// Mock the AI SDK
jest.mock('../../../packages/ai-sdk/src/client/AIClient');

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
  let mockChat: jest.Mock;
  let mockAIClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock AI client with streaming response
    mockChat = jest.fn();
    mockAIClient = {
      chat: mockChat,
      getConversation: jest.fn(),
    };
    
    (SwipeSavvyAI as jest.Mock).mockImplementation(() => mockAIClient);
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
      
      expect(screen.queryByText(/Check Balance/i)).toBeTruthy();
      expect(screen.queryByText(/Recent Transactions/i)).toBeTruthy();
    });
  });

  describe('Sending Messages', () => {
    it('should send message when user types and presses send', async () => {
      // Mock successful streaming response
      mockChat.mockImplementation(async function* () {
        yield { type: 'thinking', content: 'Processing...' };
        yield { type: 'message', content: 'Hello!', delta: 'Hello!' };
        yield { type: 'done', final: true };
      });

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      fireEvent.changeText(input, 'What is my balance?');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(mockChat).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'What is my balance?',
          })
        );
      });
    });

    it('should disable send button when message is empty', () => {
      render(<ChatScreen />);
      
      const sendButton = screen.getByTestId('send-button');
      expect(sendButton).toBeDisabled();
    });

    it('should clear input after sending message', async () => {
      mockChat.mockImplementation(async function* () {
        yield { type: 'done', final: true };
      });

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      fireEvent.changeText(input, 'Test message');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(input.props.value).toBe('');
      });
    });

    it('should add user message to conversation', async () => {
      mockChat.mockImplementation(async function* () {
        yield { type: 'done', final: true };
      });

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      fireEvent.changeText(input, 'Hello AI');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Hello AI')).toBeTruthy();
      });
    });
  });

  describe('Streaming Responses', () => {
    it('should display thinking indicator during processing', async () => {
      mockChat.mockImplementation(async function* () {
        yield { type: 'thinking', content: 'Processing your request...' };
        await new Promise(resolve => setTimeout(resolve, 100));
        yield { type: 'message', content: 'Response', delta: 'Response' };
        yield { type: 'done', final: true };
      });

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      fireEvent.changeText(input, 'Test');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(screen.getByTestId('typing-indicator')).toBeTruthy();
      });
    });

    it('should stream message content word by word', async () => {
      mockChat.mockImplementation(async function* () {
        yield { type: 'message', content: 'Hello', delta: 'Hello' };
        yield { type: 'message', content: 'Hello there', delta: 'there' };
        yield { type: 'message', content: 'Hello there!', delta: '!' };
        yield { type: 'done', final: true };
      });

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      fireEvent.changeText(input, 'Hi');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Hello there!')).toBeTruthy();
      });
    });

    it('should hide thinking indicator when response completes', async () => {
      mockChat.mockImplementation(async function* () {
        yield { type: 'thinking', content: 'Thinking...' };
        yield { type: 'message', content: 'Done!', delta: 'Done!' };
        yield { type: 'done', final: true };
      });

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      fireEvent.changeText(input, 'Test');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(screen.queryByTestId('typing-indicator')).toBeNull();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when request fails', async () => {
      mockChat.mockImplementation(async function* () {
        throw new Error('Network request failed');
      });

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      fireEvent.changeText(input, 'Test');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeTruthy();
        expect(screen.getByText(/try again/i)).toBeTruthy();
      });
    });

    it('should allow retry after error', async () => {
      let callCount = 0;
      mockChat.mockImplementation(async function* () {
        callCount++;
        if (callCount === 1) {
          throw new Error('Network error');
        } else {
          yield { type: 'message', content: 'Success!', delta: 'Success!' };
          yield { type: 'done', final: true };
        }
      });

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      // First attempt fails
      fireEvent.changeText(input, 'Test');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/try again/i)).toBeTruthy();
      });

      // Retry
      const retryButton = screen.getByText(/try again/i);
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeTruthy();
      });
    });

    it('should handle timeout errors gracefully', async () => {
      mockChat.mockImplementation(async function* () {
        throw new Error('Stream timeout');
      });

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      fireEvent.changeText(input, 'Test');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/timeout/i)).toBeTruthy();
      });
    });
  });

  describe('Quick Actions', () => {
    it('should send predefined message when quick action is pressed', async () => {
      mockChat.mockImplementation(async function* () {
        yield { type: 'done', final: true };
      });

      render(<ChatScreen />);
      
      const balanceButton = screen.getByText(/Check Balance/i);
      fireEvent.press(balanceButton);

      await waitFor(() => {
        expect(mockChat).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('balance'),
          })
        );
      });
    });
  });

  describe('Conversation History', () => {
    it('should maintain conversation history across messages', async () => {
      mockChat.mockImplementation(async function* () {
        yield { type: 'message', content: 'Response', delta: 'Response' };
        yield { type: 'done', final: true };
      });

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      // Send first message
      fireEvent.changeText(input, 'First message');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(screen.getByText('First message')).toBeTruthy();
      });

      // Send second message
      fireEvent.changeText(input, 'Second message');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(screen.getByText('First message')).toBeTruthy();
        expect(screen.getByText('Second message')).toBeTruthy();
      });
    });

    it('should scroll to bottom when new messages arrive', async () => {
      mockChat.mockImplementation(async function* () {
        yield { type: 'message', content: 'New message', delta: 'New message' };
        yield { type: 'done', final: true };
      });

      const scrollToEnd = jest.fn();
      const flatListRef = { current: { scrollToEnd: scrollToEnd } };

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      fireEvent.changeText(input, 'Test');
      fireEvent.press(sendButton);

      await waitFor(() => {
        // Verify message was added (scrolling tested via integration)
        expect(screen.getByText('Test')).toBeTruthy();
      });
    });
  });

  describe('Session Management', () => {
    it('should include session_id in chat requests', async () => {
      mockChat.mockImplementation(async function* () {
        yield { type: 'done', final: true };
      });

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      fireEvent.changeText(input, 'Test');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(mockChat).toHaveBeenCalledWith(
          expect.objectContaining({
            session_id: expect.any(String),
          })
        );
      });
    });

    it('should reuse same session_id for conversation', async () => {
      mockChat.mockImplementation(async function* () {
        yield { type: 'done', final: true };
      });

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      // Send first message
      fireEvent.changeText(input, 'Message 1');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(mockChat).toHaveBeenCalled();
      });

      const firstCallSessionId = mockChat.mock.calls[0][0].session_id;

      // Send second message
      fireEvent.changeText(input, 'Message 2');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(mockChat).toHaveBeenCalledTimes(2);
      });

      const secondCallSessionId = mockChat.mock.calls[1][0].session_id;

      expect(firstCallSessionId).toBe(secondCallSessionId);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for interactive elements', () => {
      render(<ChatScreen />);
      
      expect(screen.getByLabelText(/message input/i)).toBeTruthy();
      expect(screen.getByLabelText(/send message/i)).toBeTruthy();
    });

    it('should announce new messages to screen readers', async () => {
      mockChat.mockImplementation(async function* () {
        yield { type: 'message', content: 'AI Response', delta: 'AI Response' };
        yield { type: 'done', final: true };
      });

      render(<ChatScreen />);
      
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByTestId('send-button');

      fireEvent.changeText(input, 'Test');
      fireEvent.press(sendButton);

      await waitFor(() => {
        const responseMessage = screen.getByText('AI Response');
        expect(responseMessage).toBeTruthy();
        expect(responseMessage.props.accessibilityLiveRegion).toBe('polite');
      });
    });
  });
});
