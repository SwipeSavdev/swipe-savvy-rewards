/**
 * Performance Monitoring Utility
 * Tracks key metrics and reports performance issues
 */
class PerformanceMonitor {
    constructor() {
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { pageLoadTime: 0 }
        });
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: performance.now()
        });
    }
    init() {
        this.trackPageLoadTime();
        this.trackWebVitals();
        this.trackLongTasks();
        this.trackMemoryUsage();
    }
    trackPageLoadTime() {
        window.addEventListener('load', () => {
            this.metrics.pageLoadTime = performance.now() - this.startTime;
            this.logMetric('Page Load Time', `${this.metrics.pageLoadTime.toFixed(2)}ms`);
        });
    }
    trackWebVitals() {
        // Track Core Web Vitals
        if ('PerformanceObserver' in window) {
            try {
                // Largest Contentful Paint
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
                    this.logMetric('LCP', `${this.metrics.largestContentfulPaint.toFixed(2)}ms`);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                // Cumulative Layout Shift
                const clsObserver = new PerformanceObserver((list) => {
                    let clsValue = 0;
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    this.metrics.cumulativeLayoutShift = clsValue;
                    this.logMetric('CLS', this.metrics.cumulativeLayoutShift.toFixed(4));
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            }
            catch (e) {
                console.debug('Web Vitals monitoring not available');
            }
        }
    }
    trackLongTasks() {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            }
            catch (e) {
                console.debug('Long task monitoring not available');
            }
        }
    }
    trackMemoryUsage() {
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                const used = (memory.usedJSHeapSize / 1048576).toFixed(2);
                const limit = (memory.jsHeapSizeLimit / 1048576).toFixed(2);
                if (parseFloat(used) > parseFloat(limit) * 0.85) {
                    console.warn(`High memory usage: ${used}MB / ${limit}MB`);
                }
            }, 10000); // Check every 10 seconds
        }
    }
    logMetric(name, value) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`📊 ${name}: ${value}`);
        }
    }
    getMetrics() {
        return this.metrics;
    }
}
export const performanceMonitor = new PerformanceMonitor();
