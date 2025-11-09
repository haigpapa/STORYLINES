/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo } from 'react';
import useStore from '../store';
import { calculateGraphStats, exportStatsAsCSV, type GraphStats } from '../utils/analytics';

interface AnalyticsPanelProps {
  onClose: () => void;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ onClose }) => {
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);

  const stats: GraphStats = useMemo(
    () => calculateGraphStats(nodes, edges),
    [nodes, edges]
  );

  const handleExportCSV = () => {
    const csv = exportStatsAsCSV(stats);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `graph-analytics-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="analytics-panel" role="dialog" aria-labelledby="analytics-title" aria-modal="true">
      <div className="analytics-header">
        <h2 id="analytics-title">Graph Analytics</h2>
        <div className="analytics-header-actions">
          <button
            className="analytics-export-btn"
            onClick={handleExportCSV}
            title="Export analytics as CSV file"
            aria-label="Export analytics as CSV"
          >
            <span className="icon" aria-hidden="true">download</span>
            Export
          </button>
          <button className="close-button" onClick={onClose} aria-label="Close analytics panel">
            <span className="icon" aria-hidden="true">close</span>
          </button>
        </div>
      </div>

      <div className="analytics-content">
        {/* Overview Section */}
        <section className="analytics-section">
          <h3>Overview</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Nodes</div>
              <div className="stat-value">{stats.nodes.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Connections</div>
              <div className="stat-value">{stats.edges.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg Connections</div>
              <div className="stat-value">{stats.edges.averageConnections}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Graph Density</div>
              <div className="stat-value">{(stats.connectivity.density * 100).toFixed(1)}%</div>
            </div>
          </div>
        </section>

        {/* Node Breakdown */}
        <section className="analytics-section">
          <h3>Node Breakdown</h3>
          <div className="node-breakdown">
            <div className="breakdown-item">
              <div className="breakdown-bar">
                <div
                  className="breakdown-fill book"
                  style={{ width: `${(stats.nodes.byType.book / stats.nodes.total) * 100}%` }}
                />
              </div>
              <div className="breakdown-label">
                <span className="breakdown-type">Books</span>
                <span className="breakdown-count">{stats.nodes.byType.book}</span>
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-bar">
                <div
                  className="breakdown-fill author"
                  style={{ width: `${(stats.nodes.byType.author / stats.nodes.total) * 100}%` }}
                />
              </div>
              <div className="breakdown-label">
                <span className="breakdown-type">Authors</span>
                <span className="breakdown-count">{stats.nodes.byType.author}</span>
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-bar">
                <div
                  className="breakdown-fill theme"
                  style={{ width: `${(stats.nodes.byType.theme / stats.nodes.total) * 100}%` }}
                />
              </div>
              <div className="breakdown-label">
                <span className="breakdown-type">Themes</span>
                <span className="breakdown-count">{stats.nodes.byType.theme}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Connectivity */}
        <section className="analytics-section">
          <h3>Connectivity</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Clusters</div>
              <div className="stat-value">{stats.connectivity.clusters}</div>
              <div className="stat-hint">Disconnected groups</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Isolated Nodes</div>
              <div className="stat-value">{stats.connectivity.isolatedNodes}</div>
              <div className="stat-hint">No connections</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average Degree</div>
              <div className="stat-value">{stats.connectivity.averageDegree}</div>
              <div className="stat-hint">Connections per node</div>
            </div>
          </div>
        </section>

        {/* Most Connected */}
        {stats.edges.mostConnected.length > 0 && (
          <section className="analytics-section">
            <h3>Most Connected Nodes</h3>
            <div className="connection-list">
              {stats.edges.mostConnected.map((item, index) => (
                <div key={item.nodeId} className="connection-item">
                  <span className="connection-rank">#{index + 1}</span>
                  <span className="connection-name">{item.label}</span>
                  <span className="connection-count">{item.connections}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Themes */}
        {stats.content.topThemes.length > 0 && (
          <section className="analytics-section">
            <h3>Top Themes</h3>
            <div className="theme-list">
              {stats.content.topThemes.slice(0, 5).map(theme => (
                <div key={theme.theme} className="theme-item">
                  <span className="theme-name">{theme.theme}</span>
                  <span className="theme-connections">{theme.connections} connections</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Authors */}
        {stats.content.topAuthors.length > 0 && (
          <section className="analytics-section">
            <h3>Top Authors</h3>
            <div className="author-list">
              {stats.content.topAuthors.slice(0, 5).map(author => (
                <div key={author.author} className="author-item">
                  <span className="author-name">{author.author}</span>
                  <span className="author-books">{author.books} books</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Temporal Analysis */}
        {stats.temporal.earliestYear && (
          <section className="analytics-section">
            <h3>Temporal Distribution</h3>
            <div className="temporal-info">
              <p>
                <strong>Time Span:</strong> {stats.temporal.earliestYear} - {stats.temporal.latestYear}
                {' '}({stats.temporal.yearRange} years)
              </p>
            </div>
            {stats.temporal.booksPerDecade.length > 0 && (
              <div className="decade-chart">
                {stats.temporal.booksPerDecade.map(({ decade, count }) => {
                  const maxCount = Math.max(...stats.temporal.booksPerDecade.map(d => d.count));
                  const width = (count / maxCount) * 100;
                  return (
                    <div key={decade} className="decade-bar">
                      <span className="decade-label">{decade}</span>
                      <div className="decade-bar-container">
                        <div
                          className="decade-bar-fill"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className="decade-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Series Distribution */}
        {stats.content.seriesDistribution.length > 0 && (
          <section className="analytics-section">
            <h3>Series Distribution</h3>
            <p className="section-subtitle">
              {stats.content.totalSeries} series found
            </p>
            <div className="series-list">
              {stats.content.seriesDistribution.slice(0, 5).map(({ series, count }) => (
                <div key={series} className="series-item">
                  <span className="series-name">{series}</span>
                  <span className="series-count">{count} books</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Content Quality */}
        <section className="analytics-section">
          <h3>Content Quality</h3>
          <div className="quality-metrics">
            <div className="quality-item">
              <div className="quality-bar">
                <div
                  className="quality-fill"
                  style={{ width: `${(stats.nodes.withImages / stats.nodes.total) * 100}%` }}
                />
              </div>
              <div className="quality-label">
                <span>With Images</span>
                <span>{stats.nodes.withImages} / {stats.nodes.total}</span>
              </div>
            </div>
            <div className="quality-item">
              <div className="quality-bar">
                <div
                  className="quality-fill"
                  style={{ width: `${(stats.nodes.withDescriptions / stats.nodes.total) * 100}%` }}
                />
              </div>
              <div className="quality-label">
                <span>With Descriptions</span>
                <span>{stats.nodes.withDescriptions} / {stats.nodes.total}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
