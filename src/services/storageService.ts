import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { GraphNode, GraphEdge, SessionState } from '../types';

interface StorylineDB extends DBSchema {
  nodes: {
    key: string;
    value: GraphNode;
    indexes: { 'by-type': string };
  };
  edges: {
    key: string;
    value: GraphEdge;
  };
  sessions: {
    key: string;
    value: SessionState;
  };
  cache: {
    key: string;
    value: {
      key: string;
      data: any;
      timestamp: number;
      ttl: number;
    };
  };
}

class StorageService {
  private db: IDBPDatabase<StorylineDB> | null = null;
  private readonly DB_NAME = 'storylines-db';
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<StorylineDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Nodes store
          if (!db.objectStoreNames.contains('nodes')) {
            const nodeStore = db.createObjectStore('nodes', { keyPath: 'id' });
            nodeStore.createIndex('by-type', 'type');
          }

          // Edges store
          if (!db.objectStoreNames.contains('edges')) {
            db.createObjectStore('edges', { keyPath: 'id' });
          }

          // Sessions store
          if (!db.objectStoreNames.contains('sessions')) {
            db.createObjectStore('sessions', { keyPath: 'lastUpdated' });
          }

          // Cache store
          if (!db.objectStoreNames.contains('cache')) {
            db.createObjectStore('cache', { keyPath: 'key' });
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }

  // Node operations
  async saveNode(node: GraphNode): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db?.put('nodes', node);
  }

  async saveNodes(nodes: GraphNode[]): Promise<void> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction('nodes', 'readwrite');
    await Promise.all([
      ...nodes.map((node) => tx.store.put(node)),
      tx.done,
    ]);
  }

  async getNode(id: string): Promise<GraphNode | undefined> {
    if (!this.db) await this.initialize();
    return this.db?.get('nodes', id);
  }

  async getAllNodes(): Promise<GraphNode[]> {
    if (!this.db) await this.initialize();
    return (await this.db?.getAll('nodes')) || [];
  }

  async getNodesByType(type: string): Promise<GraphNode[]> {
    if (!this.db) await this.initialize();
    return (await this.db?.getAllFromIndex('nodes', 'by-type', type)) || [];
  }

  async deleteNode(id: string): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db?.delete('nodes', id);
  }

  // Edge operations
  async saveEdge(edge: GraphEdge): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db?.put('edges', edge);
  }

  async saveEdges(edges: GraphEdge[]): Promise<void> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction('edges', 'readwrite');
    await Promise.all([
      ...edges.map((edge) => tx.store.put(edge)),
      tx.done,
    ]);
  }

  async getAllEdges(): Promise<GraphEdge[]> {
    if (!this.db) await this.initialize();
    return (await this.db?.getAll('edges')) || [];
  }

  async deleteEdge(id: string): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db?.delete('edges', id);
  }

  // Session operations
  async saveSession(session: SessionState): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db?.put('sessions', session);
  }

  async getLatestSession(): Promise<SessionState | undefined> {
    if (!this.db) await this.initialize();
    const sessions = await this.db?.getAll('sessions');
    if (!sessions || sessions.length === 0) return undefined;
    return sessions[sessions.length - 1];
  }

  // Cache operations
  async setCache(key: string, data: any, ttl: number = 3600000): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db?.put('cache', {
      key,
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  async getCache(key: string): Promise<any | null> {
    if (!this.db) await this.initialize();
    const entry = await this.db?.get('cache', key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      await this.db?.delete('cache', key);
      return null;
    }

    return entry.data;
  }

  async clearCache(): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db?.clear('cache');
  }

  // Utility
  async clearAll(): Promise<void> {
    if (!this.db) await this.initialize();
    await Promise.all([
      this.db?.clear('nodes'),
      this.db?.clear('edges'),
      this.db?.clear('sessions'),
      this.db?.clear('cache'),
    ]);
  }

  async exportData(): Promise<any> {
    const nodes = await this.getAllNodes();
    const edges = await this.getAllEdges();
    const session = await this.getLatestSession();

    return {
      nodes,
      edges,
      session,
      exportedAt: new Date().toISOString(),
    };
  }

  async importData(data: any): Promise<void> {
    if (data.nodes) await this.saveNodes(data.nodes);
    if (data.edges) await this.saveEdges(data.edges);
    if (data.session) await this.saveSession(data.session);
  }
}

export const storageService = new StorageService();
