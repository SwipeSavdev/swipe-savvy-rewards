import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = '@swipesavvy:conversation:';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedConversation {
  messages: any[];
  timestamp: number;
  sessionId: string;
}

export const conversationCache = {
  async save(sessionId: string, messages: any[]): Promise<void> {
    try {
      const data: CachedConversation = {
        messages,
        timestamp: Date.now(),
        sessionId,
      };
      await AsyncStorage.setItem(
        `${CACHE_KEY_PREFIX}${sessionId}`,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Failed to cache conversation:', error);
    }
  },

  async load(sessionId: string): Promise<any[] | null> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${sessionId}`);
      if (!cached) return null;

      const data: CachedConversation = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - data.timestamp > CACHE_EXPIRY_MS) {
        await this.clear(sessionId);
        return null;
      }

      return data.messages;
    } catch (error) {
      console.error('Failed to load cached conversation:', error);
      return null;
    }
  },

  async clear(sessionId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${CACHE_KEY_PREFIX}${sessionId}`);
    } catch (error) {
      console.error('Failed to clear cached conversation:', error);
    }
  },

  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const conversationKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      await AsyncStorage.multiRemove(conversationKeys);
    } catch (error) {
      console.error('Failed to clear all conversations:', error);
    }
  },
};
