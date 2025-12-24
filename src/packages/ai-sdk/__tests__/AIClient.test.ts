import { SwipeSavvyAI } from '../src/client/AIClient';

// Mock XMLHttpRequest
class MockXMLHttpRequest {
  public responseText: string = '';
  public onprogress: (() => void) | null = null;
  public onload: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public status: number = 200;
  private headers: Record<string, string> = {};
  
  open(method: string, url: string) {}
  setRequestHeader(key: string, value: string) {
    this.headers[key] = value;
  }
  send(body?: string) {}
  abort() {}
}

global.XMLHttpRequest = MockXMLHttpRequest as any;

describe('SwipeSavvyAI Client', () => {
  let client: SwipeSavvyAI;
  const mockConfig = {
    baseUrl: 'http://localhost:8000',
    accessToken: 'test-token',
    userId: 'test-user',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mock Mode', () => {
    beforeEach(() => {
      // Enable mock mode
      process.env.MOCK_API = 'true';
      client = new SwipeSavvyAI(mockConfig);
    });

    afterEach(() => {
      delete process.env.MOCK_API;
    });

    it('should use mock mode when MOCK_API is true', async () => {
      const messages: any[] = [];
      
      for await (const event of client.chat({ message: 'test' })) {
        messages.push(event);
      }

      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].type).toBe('thinking');
      expect(messages[messages.length - 1].type).toBe('done');
    });

    it('should generate balance response for balance queries', async () => {
      const messages: any[] = [];
      
      for await (const event of client.chat({ message: 'What is my balance?' })) {
        if (event.type === 'message' && event.final) {
          messages.push(event);
        }
      }

      const finalMessage = messages[messages.length - 1];
      expect(finalMessage.content).toContain('$');
      expect(finalMessage.content).toMatch(/checking|savings/i);
    });

    it('should generate transaction response for transaction queries', async () => {
      const messages: any[] = [];
      
      for await (const event of client.chat({ message: 'Show my recent transactions' })) {
        if (event.type === 'message' && event.final) {
          messages.push(event);
        }
      }

      const finalMessage = messages[messages.length - 1];
      expect(finalMessage.content).toMatch(/Starbucks|Uber|Amazon/);
    });

    it('should stream words progressively', async () => {
      const messages: any[] = [];
      
      for await (const event of client.chat({ message: 'help' })) {
        if (event.type === 'message') {
          messages.push(event);
        }
      }

      // Should have multiple message events with increasing content
      expect(messages.length).toBeGreaterThan(5);
      
      let previousLength = 0;
      for (const msg of messages) {
        expect(msg.content.length).toBeGreaterThanOrEqual(previousLength);
        previousLength = msg.content.length;
      }
    });

    it('should include session_id in done event', async () => {
      let doneEvent: any = null;
      
      for await (const event of client.chat({ 
        message: 'test',
        session_id: 'test-session-123'
      })) {
        if (event.type === 'done') {
          doneEvent = event;
        }
      }

      expect(doneEvent).not.toBeNull();
      expect(doneEvent.session_id).toBe('test-session-123');
    });
  });

  describe('Live Mode - XMLHttpRequest Streaming', () => {
    let mockXHR: MockXMLHttpRequest;

    beforeEach(() => {
      delete process.env.MOCK_API;
      client = new SwipeSavvyAI(mockConfig);
      
      // Mock XMLHttpRequest
      mockXHR = new MockXMLHttpRequest();
      jest.spyOn(global, 'XMLHttpRequest').mockImplementation(() => mockXHR as any);
    });

    it('should make POST request to correct endpoint', async () => {
      const openSpy = jest.spyOn(mockXHR, 'open');
      const sendSpy = jest.spyOn(mockXHR, 'send');

      const iterator = client.chat({ 
        message: 'test',
        user_id: 'user123'
      });

      // Start iteration to trigger request
      const promise = iterator.next();

      expect(openSpy).toHaveBeenCalledWith('POST', 'http://localhost:8000/api/v1/chat');
      expect(sendSpy).toHaveBeenCalled();

      // Cleanup
      mockXHR.onerror?.();
      await promise.catch(() => {});
    });

    it('should set correct headers', async () => {
      const setHeaderSpy = jest.spyOn(mockXHR, 'setRequestHeader');

      const iterator = client.chat({ message: 'test' });
      const promise = iterator.next();

      expect(setHeaderSpy).toHaveBeenCalledWith('Authorization', 'Bearer test-token');
      expect(setHeaderSpy).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(setHeaderSpy).toHaveBeenCalledWith('X-Request-ID', expect.any(String));

      // Cleanup
      mockXHR.onerror?.();
      await promise.catch(() => {});
    });

    it('should parse SSE events correctly', async () => {
      const iterator = client.chat({ message: 'test' });
      const promise = iterator.next();

      // Simulate SSE data coming in
      mockXHR.responseText = 'data: {"type":"thinking"}\n';
      mockXHR.onprogress?.();

      const result = await promise;
      expect(result.value).toEqual({ type: 'thinking' });

      // Cleanup
      mockXHR.onload?.();
    });

    it('should handle multiple SSE events in one chunk', async () => {
      const iterator = client.chat({ message: 'test' });
      
      // First event
      const promise1 = iterator.next();
      mockXHR.responseText = 'data: {"type":"thinking"}\ndata: {"type":"message","content":"Hi"}\n';
      mockXHR.onprogress?.();

      const event1 = await promise1;
      expect(event1.value?.type).toBe('thinking');

      // Second event should be queued
      const event2 = await iterator.next();
      expect(event2.value?.type).toBe('message');
      expect(event2.value?.content).toBe('Hi');

      // Cleanup
      mockXHR.onload?.();
    });

    it('should handle network errors', async () => {
      const iterator = client.chat({ message: 'test' });
      const promise = iterator.next();

      // Trigger error
      mockXHR.onerror?.();

      await expect(promise).rejects.toThrow('Network request failed');
    });

    it('should complete when stream ends', async () => {
      const messages: any[] = [];
      const iterator = client.chat({ message: 'test' });

      // Queue up some events
      const promise = iterator.next();
      mockXHR.responseText = 'data: {"type":"message","content":"Done"}\n';
      mockXHR.onprogress?.();
      
      messages.push(await promise);

      // Complete the stream
      mockXHR.onload?.();

      // Should get done event
      const finalEvent = await iterator.next();
      expect(finalEvent.value?.type).toBe('done');
      expect(finalEvent.value?.final).toBe(true);
    });

    it('should skip incomplete JSON chunks', async () => {
      const iterator = client.chat({ message: 'test' });
      
      // Simulate partial chunk (incomplete JSON)
      const promise = iterator.next();
      mockXHR.responseText = 'data: {"type":"message","con';
      mockXHR.onprogress?.();

      // Should not throw, just skip it
      // Complete with valid data
      mockXHR.responseText = 'data: {"type":"message","content":"Hi"}\n';
      mockXHR.onprogress?.();

      const event = await promise;
      expect(event.value?.type).toBe('message');

      // Cleanup
      mockXHR.onload?.();
    });
  });

  describe('Conversation History', () => {
    beforeEach(() => {
      delete process.env.MOCK_API;
      client = new SwipeSavvyAI(mockConfig);
    });

    it('should return empty history in mock mode', async () => {
      process.env.MOCK_API = 'true';
      client = new SwipeSavvyAI(mockConfig);

      const history = await client.getConversation('test-session');
      
      expect(history.session_id).toBe('test-session');
      expect(history.messages).toEqual([]);
      expect(history.created_at).toBeTruthy();

      delete process.env.MOCK_API;
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      delete process.env.MOCK_API;
      client = new SwipeSavvyAI(mockConfig);
    });

    it('should timeout after 30 seconds', async () => {
      jest.useFakeTimers();
      
      const iterator = client.chat({ message: 'test' });
      const promise = iterator.next();

      // Fast-forward 30 seconds
      jest.advanceTimersByTime(30000);

      await expect(promise).rejects.toThrow('Stream timeout');

      jest.useRealTimers();
    });
  });

  describe('Request ID Generation', () => {
    beforeEach(() => {
      client = new SwipeSavvyAI(mockConfig);
    });

    it('should generate unique request IDs', () => {
      const client1 = new SwipeSavvyAI(mockConfig);
      const client2 = new SwipeSavvyAI(mockConfig);

      // Access private method for testing (via any)
      const id1 = (client1 as any).generateRequestId();
      const id2 = (client2 as any).generateRequestId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });
});
