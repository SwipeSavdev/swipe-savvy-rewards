import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = '@swipesavvy:offline_queue';

interface QueuedRequest {
  id: string;
  message: string;
  sessionId?: string;
  timestamp: number;
  retryCount: number;
}

export class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private maxRetries = 3;

  async init(): Promise<void> {
    await this.loadQueue();
    this.setupNetworkListener();
  }

  async addToQueue(message: string, sessionId?: string): Promise<string> {
    const request: QueuedRequest = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      sessionId,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(request);
    await this.saveQueue();
    
    // Try to process immediately if online
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      this.processQueue();
    }

    return request.id;
  }

  private async loadQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(QUEUE_KEY);
      if (queueData) {
        this.queue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener(state => {
      if (state.isConnected && this.queue.length > 0) {
        this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const request = this.queue[0];
      
      try {
        // This would be replaced with actual API call
        // For now, just simulate success
        await new Promise<void>(resolve => setTimeout(resolve, 100));
        
        // Remove from queue on success
        this.queue.shift();
        await this.saveQueue();
      } catch (error) {
        request.retryCount++;
        
        if (request.retryCount >= this.maxRetries) {
          console.error('Request failed after max retries:', request.id);
          this.queue.shift();
        } else {
          // Move to end of queue for retry
          this.queue.push(this.queue.shift()!);
        }
        
        await this.saveQueue();
        break; // Stop processing on error
      }
    }

    this.isProcessing = false;
  }

  async getQueueLength(): Promise<number> {
    return this.queue.length;
  }

  async clearQueue(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_KEY);
  }
}

export const offlineQueue = new OfflineQueue();
