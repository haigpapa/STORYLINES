/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import {
  performanceMonitor,
  formatBytes,
  getPerformanceColor,
  type PerformanceMetrics,
} from '../utils/performance';

interface PerformanceDashboardProps {
  compact?: boolean;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ compact = false }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(performanceMonitor.getMetrics());
  const [isExpanded, setIsExpanded] = useState(!compact);

  useEffect(() => {
    // Start monitoring
    performanceMonitor.start();

    // Update metrics every second
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 1000);

    return () => {
      clearInterval(interval);
      if (compact) {
        performanceMonitor.stop();
      }
    };
  }, [compact]);

  const grade = performanceMonitor.getPerformanceGrade();
  const memoryPercent = metrics.memoryUsage
    ? (metrics.memoryUsage.used / metrics.memoryUsage.limit) * 100
    : 0;

  if (compact && !isExpanded) {
    return (
      <div
        className="perf-dashboard compact"
        onClick={() => setIsExpanded(true)}
        role="button"
        tabIndex={0}
        aria-label="Expand performance monitor"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(true);
          }
        }}
      >
        <div className="perf-compact-display">
          <span className={`perf-grade ${grade.grade}`} aria-label={`Performance grade: ${grade.grade}`}>
            {grade.grade.toUpperCase()}
          </span>
          <span className="perf-fps" aria-label={`${metrics.fps} frames per second`}>
            {metrics.fps} FPS
          </span>
          <span className="icon" aria-hidden="true">expand_more</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`perf-dashboard ${compact ? 'compact expanded' : 'full'}`} role="complementary" aria-label="Performance monitor">
      <div className="perf-header">
        <h3 id="perf-title">Performance Monitor</h3>
        {compact && (
          <button
            className="perf-collapse-btn"
            onClick={() => setIsExpanded(false)}
            aria-label="Collapse performance monitor"
          >
            <span className="icon" aria-hidden="true">expand_less</span>
          </button>
        )}
      </div>

      <div className="perf-content">
        {/* Overall Grade */}
        <div className="perf-section">
          <div className="perf-grade-card" style={{ borderColor: getPerformanceColor(grade.score, 'fps') }}>
            <div className="perf-grade-label">Performance Grade</div>
            <div className={`perf-grade-value ${grade.grade}`}>{grade.grade.toUpperCase()}</div>
            <div className="perf-grade-score">{grade.score}/100</div>
          </div>
        </div>

        {/* FPS Metric */}
        <div className="perf-section">
          <div className="perf-metric">
            <div className="perf-metric-header">
              <span className="perf-metric-label">Frame Rate</span>
              <span
                className="perf-metric-value"
                style={{ color: getPerformanceColor(metrics.fps, 'fps') }}
              >
                {metrics.fps} FPS
              </span>
            </div>
            <div className="perf-meter">
              <div
                className="perf-meter-fill"
                style={{
                  width: `${Math.min((metrics.fps / 60) * 100, 100)}%`,
                  backgroundColor: getPerformanceColor(metrics.fps, 'fps'),
                }}
              />
            </div>
            <div className="perf-metric-hint">Target: 60 FPS</div>
          </div>
        </div>

        {/* Render Time */}
        <div className="perf-section">
          <div className="perf-metric">
            <div className="perf-metric-header">
              <span className="perf-metric-label">Render Time</span>
              <span
                className="perf-metric-value"
                style={{ color: getPerformanceColor(metrics.renderTime, 'time') }}
              >
                {metrics.renderTime.toFixed(1)} ms
              </span>
            </div>
            <div className="perf-meter">
              <div
                className="perf-meter-fill"
                style={{
                  width: `${Math.min((metrics.renderTime / 50) * 100, 100)}%`,
                  backgroundColor: getPerformanceColor(metrics.renderTime, 'time'),
                }}
              />
            </div>
            <div className="perf-metric-hint">Target: &lt; 20 ms</div>
          </div>
        </div>

        {/* Memory Usage */}
        {metrics.memoryUsage && (
          <div className="perf-section">
            <div className="perf-metric">
              <div className="perf-metric-header">
                <span className="perf-metric-label">Memory Usage</span>
                <span
                  className="perf-metric-value"
                  style={{ color: getPerformanceColor(memoryPercent, 'memory') }}
                >
                  {formatBytes(metrics.memoryUsage.used)}
                </span>
              </div>
              <div className="perf-meter">
                <div
                  className="perf-meter-fill"
                  style={{
                    width: `${memoryPercent}%`,
                    backgroundColor: getPerformanceColor(memoryPercent, 'memory'),
                  }}
                />
              </div>
              <div className="perf-metric-hint">
                {memoryPercent.toFixed(1)}% of {formatBytes(metrics.memoryUsage.limit)}
              </div>
            </div>
          </div>
        )}

        {/* Graph Metrics */}
        <div className="perf-section">
          <h4>Graph Metrics</h4>
          <div className="perf-stats-grid">
            <div className="perf-stat">
              <div className="perf-stat-label">Nodes</div>
              <div className="perf-stat-value">{metrics.graphMetrics.nodeCount}</div>
            </div>
            <div className="perf-stat">
              <div className="perf-stat-label">Edges</div>
              <div className="perf-stat-value">{metrics.graphMetrics.edgeCount}</div>
            </div>
            <div className="perf-stat">
              <div className="perf-stat-label">Update Time</div>
              <div className="perf-stat-value">{metrics.graphMetrics.averageRenderTime.toFixed(1)} ms</div>
            </div>
          </div>
        </div>

        {/* API Metrics */}
        {metrics.apiCalls.totalCalls > 0 && (
          <div className="perf-section">
            <h4>API Performance</h4>
            <div className="perf-stats-grid">
              <div className="perf-stat">
                <div className="perf-stat-label">Total Calls</div>
                <div className="perf-stat-value">{metrics.apiCalls.totalCalls}</div>
              </div>
              <div className="perf-stat">
                <div className="perf-stat-label">Success Rate</div>
                <div className="perf-stat-value">
                  {metrics.apiCalls.totalCalls > 0
                    ? ((metrics.apiCalls.successfulCalls / metrics.apiCalls.totalCalls) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>
              <div className="perf-stat">
                <div className="perf-stat-label">Avg Response</div>
                <div className="perf-stat-value">{metrics.apiCalls.averageResponseTime} ms</div>
              </div>
            </div>
            {metrics.apiCalls.lastError && (
              <div className="perf-error">
                <span className="icon">error</span>
                {metrics.apiCalls.lastError}
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {grade.recommendations.length > 0 && (
          <div className="perf-section">
            <h4>Recommendations</h4>
            <div className="perf-recommendations">
              {grade.recommendations.map((rec, index) => (
                <div key={index} className="perf-recommendation">
                  <span className="icon">lightbulb</span>
                  {rec}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Button */}
        <div className="perf-actions">
          <button
            className="perf-reset-btn"
            onClick={() => performanceMonitor.reset()}
            title="Reset performance metrics"
            aria-label="Reset all performance metrics"
          >
            <span className="icon" aria-hidden="true">refresh</span>
            Reset Metrics
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
