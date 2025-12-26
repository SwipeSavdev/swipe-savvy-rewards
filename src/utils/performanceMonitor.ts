/**
 * Performance Monitoring Utility
 * Tracks key metrics and reports performance issues
 */

interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  cumulativeLayoutShift?: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = { pageLoadTime: 0 }
  private startTime: number = performance.now()

  init() {
    this.trackPageLoadTime()
    this.trackWebVitals()
    this.trackLongTasks()
    this.trackMemoryUsage()
  }

  private trackPageLoadTime() {
    window.addEventListener('load', () => {
      this.metrics.pageLoadTime = performance.now() - this.startTime
      this.logMetric('Page Load Time', `${this.metrics.pageLoadTime.toFixed(2)}ms`)
    })
  }

  private trackWebVitals() {
    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime
          this.logMetric('LCP', `${this.metrics.largestContentfulPaint.toFixed(2)}ms`)
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          this.metrics.cumulativeLayoutShift = clsValue
          this.logMetric('CLS', this.metrics.cumulativeLayoutShift.toFixed(4))
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        console.debug('Web Vitals monitoring not available')
      }
    }
  }

  private trackLongTasks() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.warn(`Long task detected: ${(entry as any).duration.toFixed(2)}ms`)
          }
        })
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        console.debug('Long task monitoring not available')
      }
    }
  }

  private trackMemoryUsage() {
    if ((performance as any).memory) {
      setInterval(() => {
        const memory = (performance as any).memory
        const used = (memory.usedJSHeapSize / 1048576).toFixed(2)
        const limit = (memory.jsHeapSizeLimit / 1048576).toFixed(2)
        
        if (parseFloat(used) > parseFloat(limit) * 0.85) {
          console.warn(`High memory usage: ${used}MB / ${limit}MB`)
        }
      }, 10000) // Check every 10 seconds
    }
  }

  private logMetric(name: string, value: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${name}: ${value}`)
    }
  }

  getMetrics(): PerformanceMetrics {
    return this.metrics
  }
}

export const performanceMonitor = new PerformanceMonitor()
