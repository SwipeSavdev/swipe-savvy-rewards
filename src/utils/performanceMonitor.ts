/**
 * Performance monitoring utility for tracking app metrics
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled = __DEV__; // Only enable in development

  start(metricName: string): void {
    if (!this.enabled) return;

    this.metrics.set(metricName, {
      name: metricName,
      startTime: Date.now(),
    });
  }

  end(metricName: string): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(metricName);
    if (!metric) {
      console.warn(`Metric "${metricName}" not found`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    console.log(`⚡ Performance: ${metricName} took ${duration}ms`);
    
    return duration;
  }

  measure<T>(metricName: string, fn: () => T): T {
    if (!this.enabled) return fn();

    this.start(metricName);
    try {
      const result = fn();
      this.end(metricName);
      return result;
    } catch (error) {
      this.end(metricName);
      throw error;
    }
  }

  async measureAsync<T>(metricName: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) return fn();

    this.start(metricName);
    try {
      const result = await fn();
      this.end(metricName);
      return result;
    } catch (error) {
      this.end(metricName);
      throw error;
    }
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();
