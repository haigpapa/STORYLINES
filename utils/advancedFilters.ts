/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Node } from '../types';

export interface FilterCriteria {
  id: string;
  name: string;
  enabled: boolean;
  type: 'nodeType' | 'publicationYear' | 'series' | 'description' | 'custom';
  config: FilterConfig;
}

export type FilterConfig =
  | NodeTypeFilterConfig
  | PublicationYearFilterConfig
  | SeriesFilterConfig
  | DescriptionFilterConfig
  | CustomFilterConfig;

export interface NodeTypeFilterConfig {
  types: {
    book: boolean;
    author: boolean;
    theme: boolean;
  };
}

export interface PublicationYearFilterConfig {
  mode: 'range' | 'before' | 'after' | 'exact';
  minYear?: number;
  maxYear?: number;
  exactYear?: number;
}

export interface SeriesFilterConfig {
  mode: 'include' | 'exclude';
  seriesNames: string[];
}

export interface DescriptionFilterConfig {
  keywords: string[];
  matchMode: 'any' | 'all';
  caseSensitive: boolean;
}

export interface CustomFilterConfig {
  filterFunction: string; // Serialized function
}

export interface SavedFilter {
  id: string;
  name: string;
  description: string;
  criteria: FilterCriteria[];
  createdAt: string;
  lastUsed?: string;
}

const STORAGE_KEY = 'literary-explorer:saved-filters';

/**
 * Apply a single filter criterion to a node
 */
export const applyCriterion = (node: Node, criterion: FilterCriteria): boolean => {
  if (!criterion.enabled) return true;

  switch (criterion.type) {
    case 'nodeType': {
      const config = criterion.config as NodeTypeFilterConfig;
      return config.types[node.type as keyof typeof config.types] ?? true;
    }

    case 'publicationYear': {
      const config = criterion.config as PublicationYearFilterConfig;
      const year = node.publicationYear;

      if (!year) return false; // Filter out nodes without publication year

      switch (config.mode) {
        case 'range':
          return year >= (config.minYear ?? 0) && year <= (config.maxYear ?? 9999);
        case 'before':
          return year < (config.maxYear ?? 9999);
        case 'after':
          return year > (config.minYear ?? 0);
        case 'exact':
          return year === config.exactYear;
        default:
          return true;
      }
    }

    case 'series': {
      const config = criterion.config as SeriesFilterConfig;
      const hasSeries = node.series && config.seriesNames.includes(node.series);
      return config.mode === 'include' ? hasSeries : !hasSeries;
    }

    case 'description': {
      const config = criterion.config as DescriptionFilterConfig;
      const description = (node.description || '').toLowerCase();

      const matches = config.keywords.map(keyword => {
        const search = config.caseSensitive ? keyword : keyword.toLowerCase();
        return description.includes(search);
      });

      return config.matchMode === 'all'
        ? matches.every(m => m)
        : matches.some(m => m);
    }

    case 'custom': {
      // Custom filter functions can be dangerous, so we'll skip for now
      // Could be implemented with safe evaluation in the future
      return true;
    }

    default:
      return true;
  }
};

/**
 * Apply multiple filter criteria to a node (AND logic)
 */
export const applyFilters = (node: Node, criteria: FilterCriteria[]): boolean => {
  return criteria.every(criterion => applyCriterion(node, criterion));
};

/**
 * Filter a collection of nodes
 */
export const filterNodes = (
  nodes: Record<string, Node>,
  criteria: FilterCriteria[]
): Record<string, Node> => {
  const filtered: Record<string, Node> = {};

  Object.entries(nodes).forEach(([id, node]) => {
    if (applyFilters(node, criteria)) {
      filtered[id] = node;
    }
  });

  return filtered;
};

/**
 * Save a filter preset
 */
export const saveFilter = (filter: SavedFilter): boolean => {
  try {
    const saved = getSavedFilters();
    const index = saved.findIndex(f => f.id === filter.id);

    if (index >= 0) {
      saved[index] = filter;
    } else {
      saved.push(filter);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return true;
  } catch (error) {
    console.error('Failed to save filter:', error);
    return false;
  }
};

/**
 * Load all saved filters
 */
export const getSavedFilters = (): SavedFilter[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load saved filters:', error);
    return [];
  }
};

/**
 * Delete a saved filter
 */
export const deleteFilter = (filterId: string): boolean => {
  try {
    const saved = getSavedFilters();
    const filtered = saved.filter(f => f.id !== filterId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete filter:', error);
    return false;
  }
};

/**
 * Get filter by ID
 */
export const getFilterById = (filterId: string): SavedFilter | null => {
  const filters = getSavedFilters();
  return filters.find(f => f.id === filterId) || null;
};

/**
 * Update last used timestamp
 */
export const updateFilterLastUsed = (filterId: string): void => {
  const filter = getFilterById(filterId);
  if (filter) {
    filter.lastUsed = new Date().toISOString();
    saveFilter(filter);
  }
};

/**
 * Create a default filter preset
 */
export const createDefaultFilter = (name: string): SavedFilter => {
  return {
    id: `filter-${Date.now()}`,
    name,
    description: '',
    criteria: [
      {
        id: `criterion-${Date.now()}`,
        name: 'Node Types',
        enabled: true,
        type: 'nodeType',
        config: {
          types: {
            book: true,
            author: true,
            theme: true,
          },
        },
      },
    ],
    createdAt: new Date().toISOString(),
  };
};

/**
 * Get filter statistics
 */
export const getFilterStats = (
  nodes: Record<string, Node>,
  criteria: FilterCriteria[]
): {
  total: number;
  filtered: number;
  percentage: number;
} => {
  const total = Object.keys(nodes).length;
  const filtered = Object.keys(filterNodes(nodes, criteria)).length;

  return {
    total,
    filtered,
    percentage: total > 0 ? (filtered / total) * 100 : 0,
  };
};
