import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Graph, GraphNode, GraphEdge, ReadingListItem, Bookmark, JournalEntry } from '../types';

interface GraphStore {
  // Graph state
  graph: Graph;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;

  // UI state
  isSearchOpen: boolean;
  isJournalOpen: boolean;
  isSettingsOpen: boolean;

  // Reading lists and bookmarks
  readingList: ReadingListItem[];
  bookmarks: Bookmark[];

  // Dev journal
  journalEntries: JournalEntry[];

  // Viewport
  viewportTransform: { x: number; y: number; k: number };

  // Actions
  addNode: (node: GraphNode) => void;
  addNodes: (nodes: GraphNode[]) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<GraphNode>) => void;

  addEdge: (edge: GraphEdge) => void;
  addEdges: (edges: GraphEdge[]) => void;
  removeEdge: (edgeId: string) => void;

  setSelectedNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;

  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;

  // Reading list actions
  addToReadingList: (item: ReadingListItem) => void;
  removeFromReadingList: (nodeId: string) => void;
  updateReadingListItem: (nodeId: string, updates: Partial<ReadingListItem>) => void;

  // Bookmark actions
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (bookmarkId: string) => void;

  // Journal actions
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
  clearJournal: () => void;

  // UI actions
  toggleSearch: () => void;
  toggleJournal: () => void;
  toggleSettings: () => void;

  setViewportTransform: (transform: { x: number; y: number; k: number }) => void;

  // Utility
  clearGraph: () => void;
  loadSession: (session: any) => void;
}

export const useGraphStore = create<GraphStore>()(
  persist(
    (set, get) => ({
      // Initial state
      graph: { nodes: [], edges: [] },
      selectedNodeId: null,
      hoveredNodeId: null,
      isSearchOpen: true,
      isJournalOpen: false,
      isSettingsOpen: false,
      readingList: [],
      bookmarks: [],
      journalEntries: [],
      viewportTransform: { x: 0, y: 0, k: 1 },

      // Node actions
      addNode: (node) => set((state) => ({
        graph: {
          ...state.graph,
          nodes: [...state.graph.nodes, node],
        },
      })),

      addNodes: (nodes) => set((state) => ({
        graph: {
          ...state.graph,
          nodes: [...state.graph.nodes, ...nodes],
        },
      })),

      removeNode: (nodeId) => set((state) => ({
        graph: {
          nodes: state.graph.nodes.filter((n) => n.id !== nodeId),
          edges: state.graph.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        },
      })),

      updateNode: (nodeId, updates) => set((state) => ({
        graph: {
          ...state.graph,
          nodes: state.graph.nodes.map((n) =>
            n.id === nodeId ? { ...n, ...updates } : n
          ),
        },
      })),

      // Edge actions
      addEdge: (edge) => set((state) => ({
        graph: {
          ...state.graph,
          edges: [...state.graph.edges, edge],
        },
      })),

      addEdges: (edges) => set((state) => ({
        graph: {
          ...state.graph,
          edges: [...state.graph.edges, ...edges],
        },
      })),

      removeEdge: (edgeId) => set((state) => ({
        graph: {
          ...state.graph,
          edges: state.graph.edges.filter((e) => e.id !== edgeId),
        },
      })),

      // Selection
      setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
      setHoveredNode: (nodeId) => set({ hoveredNodeId: nodeId }),

      // Expansion
      expandNode: (nodeId) => set((state) => ({
        graph: {
          ...state.graph,
          nodes: state.graph.nodes.map((n) =>
            n.id === nodeId ? { ...n, expanded: true } : n
          ),
        },
      })),

      collapseNode: (nodeId) => set((state) => ({
        graph: {
          ...state.graph,
          nodes: state.graph.nodes.map((n) =>
            n.id === nodeId ? { ...n, expanded: false } : n
          ),
        },
      })),

      // Reading list
      addToReadingList: (item) => set((state) => ({
        readingList: [...state.readingList, item],
      })),

      removeFromReadingList: (nodeId) => set((state) => ({
        readingList: state.readingList.filter((item) => item.nodeId !== nodeId),
      })),

      updateReadingListItem: (nodeId, updates) => set((state) => ({
        readingList: state.readingList.map((item) =>
          item.nodeId === nodeId ? { ...item, ...updates } : item
        ),
      })),

      // Bookmarks
      addBookmark: (bookmark) => set((state) => ({
        bookmarks: [...state.bookmarks, bookmark],
      })),

      removeBookmark: (bookmarkId) => set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId),
      })),

      // Journal
      addJournalEntry: (entry) => set((state) => ({
        journalEntries: [
          ...state.journalEntries,
          {
            ...entry,
            id: `journal-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
          },
        ],
      })),

      clearJournal: () => set({ journalEntries: [] }),

      // UI toggles
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      toggleJournal: () => set((state) => ({ isJournalOpen: !state.isJournalOpen })),
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

      // Viewport
      setViewportTransform: (transform) => set({ viewportTransform: transform }),

      // Utility
      clearGraph: () => set({
        graph: { nodes: [], edges: [] },
        selectedNodeId: null,
        hoveredNodeId: null,
      }),

      loadSession: (session) => set({
        graph: session.graph || { nodes: [], edges: [] },
        readingList: session.readingList || [],
        bookmarks: session.bookmarks || [],
        viewportTransform: session.viewportTransform || { x: 0, y: 0, k: 1 },
      }),
    }),
    {
      name: 'storylines-storage',
      partialize: (state) => ({
        graph: state.graph,
        readingList: state.readingList,
        bookmarks: state.bookmarks,
        viewportTransform: state.viewportTransform,
        journalEntries: state.journalEntries,
      }),
    }
  )
);
