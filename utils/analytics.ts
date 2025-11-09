/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Node, Edge } from '../types';

export interface GraphStats {
  nodes: NodeStats;
  edges: EdgeStats;
  connectivity: ConnectivityStats;
  content: ContentStats;
  temporal: TemporalStats;
}

export interface NodeStats {
  total: number;
  byType: {
    book: number;
    author: number;
    theme: number;
  };
  withImages: number;
  withDescriptions: number;
  withSeries: number;
}

export interface EdgeStats {
  total: number;
  averageConnections: number;
  mostConnected: {
    nodeId: string;
    label: string;
    connections: number;
  }[];
  leastConnected: {
    nodeId: string;
    label: string;
    connections: number;
  }[];
}

export interface ConnectivityStats {
  averageDegree: number;
  density: number;
  clusters: number;
  isolatedNodes: number;
}

export interface ContentStats {
  totalSeries: number;
  seriesDistribution: { series: string; count: number }[];
  topThemes: { theme: string; connections: number }[];
  topAuthors: { author: string; books: number }[];
}

export interface TemporalStats {
  earliestYear: number | null;
  latestYear: number | null;
  yearRange: number;
  booksPerDecade: { decade: string; count: number }[];
}

/**
 * Calculate comprehensive graph statistics
 */
export const calculateGraphStats = (
  nodes: Record<string, Node>,
  edges: Edge[]
): GraphStats => {
  const nodeList = Object.values(nodes);

  return {
    nodes: calculateNodeStats(nodeList),
    edges: calculateEdgeStats(nodes, edges),
    connectivity: calculateConnectivityStats(nodes, edges),
    content: calculateContentStats(nodeList, edges),
    temporal: calculateTemporalStats(nodeList),
  };
};

/**
 * Calculate node statistics
 */
const calculateNodeStats = (nodes: Node[]): NodeStats => {
  return {
    total: nodes.length,
    byType: {
      book: nodes.filter(n => n.type === 'book').length,
      author: nodes.filter(n => n.type === 'author').length,
      theme: nodes.filter(n => n.type === 'theme').length,
    },
    withImages: nodes.filter(n => n.imageUrl).length,
    withDescriptions: nodes.filter(n => n.description).length,
    withSeries: nodes.filter(n => n.series).length,
  };
};

/**
 * Calculate edge statistics
 */
const calculateEdgeStats = (
  nodes: Record<string, Node>,
  edges: Edge[]
): EdgeStats => {
  const connectionCount = new Map<string, number>();

  edges.forEach(edge => {
    connectionCount.set(edge.source, (connectionCount.get(edge.source) || 0) + 1);
    connectionCount.set(edge.target, (connectionCount.get(edge.target) || 0) + 1);
  });

  const nodeConnections = Array.from(connectionCount.entries())
    .map(([nodeId, connections]) => ({
      nodeId,
      label: nodes[nodeId]?.label || nodeId,
      connections,
    }))
    .sort((a, b) => b.connections - a.connections);

  const totalConnections = Array.from(connectionCount.values()).reduce((a, b) => a + b, 0);
  const avgConnections = connectionCount.size > 0 ? totalConnections / connectionCount.size : 0;

  return {
    total: edges.length,
    averageConnections: Math.round(avgConnections * 10) / 10,
    mostConnected: nodeConnections.slice(0, 5),
    leastConnected: nodeConnections.slice(-5).reverse(),
  };
};

/**
 * Calculate connectivity statistics
 */
const calculateConnectivityStats = (
  nodes: Record<string, Node>,
  edges: Edge[]
): ConnectivityStats => {
  const nodeCount = Object.keys(nodes).length;
  const edgeCount = edges.length;

  // Build adjacency list
  const adjacency = new Map<string, Set<string>>();
  Object.keys(nodes).forEach(nodeId => adjacency.set(nodeId, new Set()));

  edges.forEach(edge => {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  });

  // Calculate average degree
  const totalDegree = Array.from(adjacency.values()).reduce(
    (sum, neighbors) => sum + neighbors.size,
    0
  );
  const averageDegree = nodeCount > 0 ? totalDegree / nodeCount : 0;

  // Calculate density
  const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
  const density = maxEdges > 0 ? edgeCount / maxEdges : 0;

  // Find connected components (clusters) using DFS
  const visited = new Set<string>();
  let clusters = 0;

  const dfs = (nodeId: string) => {
    visited.add(nodeId);
    adjacency.get(nodeId)?.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    });
  };

  Object.keys(nodes).forEach(nodeId => {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
      clusters++;
    }
  });

  // Count isolated nodes (degree 0)
  const isolatedNodes = Array.from(adjacency.values()).filter(
    neighbors => neighbors.size === 0
  ).length;

  return {
    averageDegree: Math.round(averageDegree * 10) / 10,
    density: Math.round(density * 1000) / 1000,
    clusters,
    isolatedNodes,
  };
};

/**
 * Calculate content statistics
 */
const calculateContentStats = (nodes: Node[], edges: Edge[]): ContentStats => {
  // Series distribution
  const seriesMap = new Map<string, number>();
  nodes
    .filter(n => n.series)
    .forEach(n => {
      const series = n.series!;
      seriesMap.set(series, (seriesMap.get(series) || 0) + 1);
    });

  const seriesDistribution = Array.from(seriesMap.entries())
    .map(([series, count]) => ({ series, count }))
    .sort((a, b) => b.count - a.count);

  // Top themes by connections
  const themeConnections = new Map<string, number>();
  const themes = nodes.filter(n => n.type === 'theme');

  themes.forEach(theme => {
    const connections = edges.filter(
      e => e.source === theme.label || e.target === theme.label
    ).length;
    themeConnections.set(theme.label, connections);
  });

  const topThemes = Array.from(themeConnections.entries())
    .map(([theme, connections]) => ({ theme, connections }))
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 10);

  // Top authors by book count
  const authorBooks = new Map<string, number>();
  const authors = nodes.filter(n => n.type === 'author');

  authors.forEach(author => {
    const bookCount = edges.filter(
      e =>
        (e.source === author.label || e.target === author.label) &&
        (nodes.find(n => n.label === e.source)?.type === 'book' ||
          nodes.find(n => n.label === e.target)?.type === 'book')
    ).length;
    authorBooks.set(author.label, bookCount);
  });

  const topAuthors = Array.from(authorBooks.entries())
    .map(([author, books]) => ({ author, books }))
    .sort((a, b) => b.books - a.books)
    .slice(0, 10);

  return {
    totalSeries: seriesMap.size,
    seriesDistribution: seriesDistribution.slice(0, 10),
    topThemes,
    topAuthors,
  };
};

/**
 * Calculate temporal statistics
 */
const calculateTemporalStats = (nodes: Node[]): TemporalStats => {
  const years = nodes
    .filter(n => n.publicationYear)
    .map(n => n.publicationYear!);

  if (years.length === 0) {
    return {
      earliestYear: null,
      latestYear: null,
      yearRange: 0,
      booksPerDecade: [],
    };
  }

  const earliestYear = Math.min(...years);
  const latestYear = Math.max(...years);
  const yearRange = latestYear - earliestYear;

  // Books per decade
  const decadeMap = new Map<string, number>();
  years.forEach(year => {
    const decade = Math.floor(year / 10) * 10;
    const decadeLabel = `${decade}s`;
    decadeMap.set(decadeLabel, (decadeMap.get(decadeLabel) || 0) + 1);
  });

  const booksPerDecade = Array.from(decadeMap.entries())
    .map(([decade, count]) => ({ decade, count }))
    .sort((a, b) => {
      const aYear = parseInt(a.decade);
      const bYear = parseInt(b.decade);
      return aYear - bYear;
    });

  return {
    earliestYear,
    latestYear,
    yearRange,
    booksPerDecade,
  };
};

/**
 * Export stats as CSV
 */
export const exportStatsAsCSV = (stats: GraphStats): string => {
  const lines: string[] = [];

  lines.push('Graph Statistics Export');
  lines.push('');

  lines.push('Node Statistics');
  lines.push(`Total Nodes,${stats.nodes.total}`);
  lines.push(`Books,${stats.nodes.byType.book}`);
  lines.push(`Authors,${stats.nodes.byType.author}`);
  lines.push(`Themes,${stats.nodes.byType.theme}`);
  lines.push(`With Images,${stats.nodes.withImages}`);
  lines.push('');

  lines.push('Edge Statistics');
  lines.push(`Total Edges,${stats.edges.total}`);
  lines.push(`Average Connections,${stats.edges.averageConnections}`);
  lines.push('');

  lines.push('Connectivity');
  lines.push(`Average Degree,${stats.connectivity.averageDegree}`);
  lines.push(`Density,${stats.connectivity.density}`);
  lines.push(`Clusters,${stats.connectivity.clusters}`);
  lines.push('');

  if (stats.temporal.earliestYear) {
    lines.push('Temporal Range');
    lines.push(`Earliest,${stats.temporal.earliestYear}`);
    lines.push(`Latest,${stats.temporal.latestYear}`);
    lines.push(`Range,${stats.temporal.yearRange} years`);
  }

  return lines.join('\n');
};
