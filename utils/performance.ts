/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: MemoryUsage | null;
  apiCalls: APIMetrics;
  graphMetrics: GraphPerformance;
}

export interface MemoryUsage {
  used: number;
  total: number;
  limit: number;
}

export interface APIMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageResponseTime: number;
  lastError: string | null;
}

export interface GraphPerformance {
  nodeCount: number;
  edgeCount: number;
  averageRenderTime: number;
  lastUpdateTime: number;
}

export interface PerformanceRecord {
  timestamp: number;
  metrics: PerformanceMetrics;
}

class PerformanceMonitor {
  private frameCount: number = 0;
  private lastFrameTime: number = performance.now();
  private fps: number = 60;
  private renderTimes: number[] = [];
  private maxRenderSamples: number = 60;

  private apiCallTimes: number[] = [];
  private apiSuccesses: number = 0;
  private apiFailures: number = 0;
  private lastAPIError: string | null = null;

  private graphUpdateTimes: number[] = [];
  private currentNodeCount: number = 0;
  private currentEdgeCount: number = 0;

  private history: PerformanceRecord[] = [];
  private maxHistorySize: number = 100;

  private rafId: number | null = null;
  private isMonitoring: boolean = false;

  /**
   * Start monitoring performance
   */
  public start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.measureFPS();
  }

  /**
   * Stop monitoring performance
   */
  public stop(): void {
    this.isMonitoring = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Measure FPS using requestAnimationFrame
   */
  private measureFPS(): void {
    if (!this.isMonitoring) return;

    this.rafId = requestAnimationFrame(() => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;

      this.frameCount++;

      // Update FPS every second
      if (delta >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / delta);
        this.frameCount = 0;
        this.lastFrameTime = now;

        // Record metrics
        this.recordMetrics();
      }

      this.measureFPS();
    });
  }

  /**
   * Track a render operation
   */
  public trackRender(renderTime: number): void {
    this.renderTimes.push(renderTime);
    if (this.renderTimes.length > this.maxRenderSamples) {
      this.renderTimes.shift();
    }
  }

  /**
   * Track an API call
   */
  public trackAPICall(responseTime: number, success: boolean, error?: string): void {
    this.apiCallTimes.push(responseTime);

    if (success) {
      this.apiSuccesses++;
    } else {
      this.apiFailures++;
      this.lastAPIError = error || 'Unknown error';
    }

    // Keep only last 50 call times
    if (this.apiCallTimes.length > 50) {
      this.apiCallTimes.shift();
    }
  }

  /**
   * Track graph update
   */
  public trackGraphUpdate(nodeCount: number, edgeCount: number, updateTime: number): void {
    this.currentNodeCount = nodeCount;
    this.currentEdgeCount = edgeCount;
    this.graphUpdateTimes.push(updateTime);

    if (this.graphUpdateTimes.length > 30) {
      this.graphUpdateTimes.shift();
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      renderTime: this.getAverageRenderTime(),
      memoryUsage: this.getMemoryUsage(),
      apiCalls: {
        totalCalls: this.apiSuccesses + this.apiFailures,
        successfulCalls: this.apiSuccesses,
        failedCalls: this.apiFailures,
        averageResponseTime: this.getAverageAPITime(),
        lastError: this.lastAPIError,
      },
      graphMetrics: {
        nodeCount: this.currentNodeCount,
        edgeCount: this.currentEdgeCount,
        averageRenderTime: this.getAverageGraphUpdateTime(),
        lastUpdateTime: this.graphUpdateTimes[this.graphUpdateTimes.length - 1] || 0,
      },
    };
  }

  /**
   * Get memory usage (if available)
   */
  private getMemoryUsage(): MemoryUsage | null {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * Get average render time
   */
  private getAverageRenderTime(): number {
    if (this.renderTimes.length === 0) return 0;
    const sum = this.renderTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.renderTimes.length * 100) / 100;
  }

  /**
   * Get average API response time
   */
  private getAverageAPITime(): number {
    if (this.apiCallTimes.length === 0) return 0;
    const sum = this.apiCallTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.apiCallTimes.length);
  }

  /**
   * Get average graph update time
   */
  private getAverageGraphUpdateTime(): number {
    if (this.graphUpdateTimes.length === 0) return 0;
    const sum = this.graphUpdateTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.graphUpdateTimes.length * 100) / 100;
  }

  /**
   * Record current metrics to history
   */
  private recordMetrics(): void {
    const record: PerformanceRecord = {
      timestamp: Date.now(),
      metrics: this.getMetrics(),
    };

    this.history.push(record);

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Get performance history
   */
  public getHistory(): PerformanceRecord[] {
    return [...this.history];
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.frameCount = 0;
    this.fps = 60;
    this.renderTimes = [];
    this.apiCallTimes = [];
    this.apiSuccesses = 0;
    this.apiFailures = 0;
    this.lastAPIError = null;
    this.graphUpdateTimes = [];
    this.history = [];
  }

  /**
   * Get performance grade based on metrics
   */
  public getPerformanceGrade(): {
    grade: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    let score = 100;
    const recommendations: string[] = [];

    // FPS check
    if (metrics.fps < 30) {
      score -= 30;
      recommendations.push('Low FPS detected. Consider reducing node count or disabling effects.');
    } else if (metrics.fps < 50) {
      score -= 15;
      recommendations.push('FPS could be improved. Try reducing graph complexity.');
    }

    // Render time check
    if (metrics.renderTime > 50) {
      score -= 20;
      recommendations.push('High render time. Consider optimizing graph visualization.');
    } else if (metrics.renderTime > 30) {
      score -= 10;
    }

    // Memory check
    if (metrics.memoryUsage) {
      const memoryPercent = (metrics.memoryUsage.used / metrics.memoryUsage.limit) * 100;
      if (memoryPercent > 80) {
        score -= 25;
        recommendations.push('High memory usage. Clear unused nodes or reduce graph size.');
      } else if (memoryPercent > 60) {
        score -= 10;
      }
    }

    // API reliability check
    const apiFailRate = metrics.apiCalls.totalCalls > 0
      ? (metrics.apiCalls.failedCalls / metrics.apiCalls.totalCalls) * 100
      : 0;

    if (apiFailRate > 20) {
      score -= 15;
      recommendations.push('High API failure rate. Check network connection.');
    }

    // Determine grade
    let grade: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 90) grade = 'excellent';
    else if (score >= 70) grade = 'good';
    else if (score >= 50) grade = 'fair';
    else grade = 'poor';

    return { grade, score, recommendations };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Format bytes to human-readable string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get performance color based on value
 */
export const getPerformanceColor = (
  value: number,
  type: 'fps' | 'memory' | 'time'
): string => {
  switch (type) {
    case 'fps':
      if (value >= 55) return '#10b981'; // green
      if (value >= 40) return '#f59e0b'; // yellow
      return '#ef4444'; // red

    case 'memory':
      if (value < 60) return '#10b981';
      if (value < 80) return '#f59e0b';
      return '#ef4444';

    case 'time':
      if (value < 20) return '#10b981';
      if (value < 40) return '#f59e0b';
      return '#ef4444';

    default:
      return '#6b7280';
  }
};
