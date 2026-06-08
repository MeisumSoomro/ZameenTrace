// frontend/lib/performance-monitor.js
// Performance monitoring utility

export class PerformanceMonitor {
  static metrics = {};

  static mark(name) {
    if (typeof window !== 'undefined') {
      performance.mark(name);
    }
  }

  static measure(name, startMark, endMark) {
    if (typeof window !== 'undefined') {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        this.metrics[name] = measure.duration;
        console.log(`✓ ${name}: ${measure.duration.toFixed(2)}ms`);
      } catch (e) {
        console.error(`Could not measure ${name}:`, e);
      }
    }
  }

  static reportMetrics() {
    if (typeof window !== 'undefined') {
      const nav = window.performance.getEntriesByType('navigation')[0];
      if (nav) {
        console.log('📊 Page Performance Metrics:');
        console.log(`  DNS: ${(nav.domainLookupEnd - nav.domainLookupStart).toFixed(2)}ms`);
        console.log(`  TCP: ${(nav.connectEnd - nav.connectStart).toFixed(2)}ms`);
        console.log(`  TTFB: ${(nav.responseStart - nav.fetchStart).toFixed(2)}ms`);
        console.log(`  DOM Parse: ${(nav.domInteractive - nav.domLoading).toFixed(2)}ms`);
        console.log(`  DOM Content Loaded: ${(nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart).toFixed(2)}ms`);
        console.log(`  Page Load: ${(nav.loadEventEnd - nav.loadEventStart).toFixed(2)}ms`);
      }
    }
  }

  static trackApiCall(endpoint, duration) {
    console.log(`📡 API Call [${endpoint}]: ${duration.toFixed(2)}ms`);
  }
}

export default PerformanceMonitor;
