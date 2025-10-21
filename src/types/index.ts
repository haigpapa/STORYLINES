// Core node types in the literary graph
export type NodeType = 'author' | 'book' | 'genre' | 'theme' | 'character' | 'movement';

// Edge types representing relationships
export type EdgeType = 'wrote' | 'influenced' | 'belongs_to' | 'features' | 'related_to' | 'part_of';

// Base node interface
export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  metadata: NodeMetadata;
  expanded: boolean;
  depth: number;
}

// Metadata varies by node type
export interface NodeMetadata {
  description?: string;
  year?: number;
  imageUrl?: string;
  authors?: string[];
  genres?: string[];
  themes?: string[];
  isbn?: string;
  openLibraryId?: string;
  googleBooksId?: string;
  aiInsight?: string;
  popularity?: number;
  [key: string]: any;
}

// Edge connecting two nodes
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  strength: number;
}

// Complete graph structure
export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Search result from APIs
export interface SearchResult {
  id: string;
  type: NodeType;
  title: string;
  author?: string;
  year?: number;
  description?: string;
  coverUrl?: string;
  source: 'openlibrary' | 'google' | 'manual';
  metadata: Record<string, any>;
}

// Reading list item
export interface ReadingListItem {
  nodeId: string;
  addedAt: Date;
  notes?: string;
  status?: 'to_read' | 'reading' | 'completed';
}

// Bookmark for saving interesting nodes
export interface Bookmark {
  id: string;
  nodeId: string;
  createdAt: Date;
  tags: string[];
  notes?: string;
}

// Session state for resuming
export interface SessionState {
  graph: Graph;
  selectedNodeId?: string;
  viewportTransform: {
    x: number;
    y: number;
    k: number;
  };
  readingList: ReadingListItem[];
  bookmarks: Bookmark[];
  lastUpdated: Date;
}

// Dev journal entry
export interface JournalEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'decision' | 'technical' | 'milestone';
  message: string;
  metadata?: Record<string, any>;
}

// AI enrichment request/response
export interface AIEnrichmentRequest {
  nodeId: string;
  nodeType: NodeType;
  context: string;
}

export interface AIEnrichmentResponse {
  nodeId: string;
  insight: string;
  relatedConcepts: string[];
  connections: Array<{
    targetId: string;
    relationship: string;
    explanation: string;
  }>;
}

// API response types
export interface OpenLibraryWork {
  key: string;
  title: string;
  authors?: Array<{ author: { key: string }; type: { key: string } }>;
  subjects?: string[];
  description?: string | { value: string };
  first_publish_date?: string;
  covers?: number[];
}

export interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      small?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

// Configuration
export interface AppConfig {
  geminiApiKey?: string;
  maxNodes: number;
  maxDepth: number;
  forceStrength: number;
  enableGPU: boolean;
  cacheEnabled: boolean;
}
