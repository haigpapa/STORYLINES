# STORYLINES

> A force-directed knowledge constellation where semantic proximity, not alphabetical order, governs spatial organization.

## 0. System Intent

This system treats memory as geography rather than chronology. It proves that information organized by meaning—not by time or hierarchy—becomes navigable rather than merely searchable.

It exists to make knowledge voyageable.

## 1. Why This System Exists

**What failed before:**
- Libraries organize by alphabet or timestamp, not by thematic resonance
- Search assumes you know what you're looking for (query-driven, not exploration-driven)
- File systems are hierarchical trees that force false categorization (Is this document "Work" or "Research"? Both? Neither?)
- Knowledge graphs require manual tagging and maintenance

**What tension shaped this design:**
Human memory doesn't work like a database. We recall by association, by emotional adjacency, by semantic gravity. A scent triggers a memory triggers a place triggers a person. This system honors that associative logic instead of imposing grid-based filing systems.

Displacement and exile taught that memories don't organize chronologically. They cluster by meaning: "moments of safety," "instances of rupture," "fragments of home." STORYLINES embodies this spatial-semantic memory structure.

**What this explicitly does NOT do:**
- Replace traditional databases or file systems
- Guarantee deterministic retrieval (same query may surface different results based on semantic drift)
- Support real-time collaboration (async-first by design)
- Work offline (requires vector embedding API)
- Scale to millions of documents without performance degradation

## 2. System Boundary

**Inputs:**
- Text documents (Markdown, plain text, PDF)
- Book metadata (title, author, publication year, genre)
- User-provided annotations and highlights
- Semantic queries (natural language questions, not keyword search)

**Transformation:**
- Text → Vector embeddings (768-dimensional semantic space via Gemini 2.5)
- Embeddings → Force-directed graph (D3-Force physics simulation)
- Semantic proximity → Spatial distance in 3D constellation
- Document clusters → Color-coded thematic regions

**Outputs:**
- Interactive 3D graph visualization (navigable via mouse/trackpad)
- Document preview on hover/click
- Semantic search results rendered as spatial proximity
- Exportable constellation snapshots (JSON, PNG)

**External Dependencies:**
- Gemini 2.5 Flash (text embeddings)
- ChromaDB (vector database for persistence)
- HDBSCAN (clustering algorithm for thematic regions)
- D3-Force + Rapier Physics (force-directed layout + collision detection)

## 3. Architectural Approach

**Core Design Principles:**

1. **Meaning is Spatial**: Documents that share semantic content should be physically close in 3D space. You voyage through knowledge rather than query it.

2. **Physics as Metaphor**: Gravity, attraction, repulsion simulate human memory's associative logic. Strongly related concepts "pull" toward each other; unrelated ones drift apart.

3. **Navigable Latency**: Slow, deliberate exploration > instant keyword search. The system encourages serendipity and adjacent discovery.

**Chosen Abstractions:**

- **Force-Directed Graph**: Documents are nodes, semantic similarity is edge weight. Physics simulation settles into equilibrium where proximity = similarity.

- **3D Spatial Layout**: Not just 2D network diagrams. Three dimensions allow for richer clustering without visual overlap. You can orbit the constellation to see different facets.

- **Color-Coded Clusters**: HDBSCAN identifies thematic regions; each cluster gets a color. Visual shorthand for "this area is about displacement," "that area is about architecture."

- **Lazy Loading**: Only compute embeddings for visible nodes. Don't precompute the entire graph—build it as you explore.

**Trade-offs Accepted:**

- **Compute Intensity**: Force-directed layout is O(n²) complexity. Can handle ~1000 nodes smoothly; slows beyond that. Acceptable for personal libraries, not institutional archives.

- **Non-Deterministic Layout**: Physics simulation introduces randomness. Same dataset won't produce identical layouts. Some users find this disorienting; we find it generative.

- **Embedding API Dependency**: Requires Gemini API for vector generation. Can't run fully offline. Cost scales with document count.

- **No Version Control**: Graph state is ephemeral. No undo/redo for rearrangements. Embraces impermanence.

## 4. Choreography Layer

This system coordinates four dimensions:

**Attention:**
The camera orbits a 3D constellation. Where you look determines what becomes legible. Peripheral nodes blur; focused nodes sharpen. Attention becomes spatial—you direct your gaze like a spotlight.

**Memory:**
The graph IS a memory palace. Spatial position encodes semantic meaning. Return to the same region and you'll find thematically related content. Memory as geography, not timeline.

**Time:**
The physics simulation runs continuously. Nodes drift slowly as new content is added. The constellation is never "done"—it's a living structure that evolves. You witness knowledge reorganizing itself over time.

**Interaction:**
Hovering reveals; clicking anchors. You don't "search"—you voyage. The system rewards curiosity and tangential exploration. Getting "lost" in the graph is the intended use case.

## 5. Technical Stack (Justified)

| Technology | Why This Choice |
|------------|-----------------|
| **React Three Fiber** | Declarative 3D rendering in React. Treat 3D scene as React components rather than imperative Three.js calls. Clean integration with app state. |
| **D3-Force** | Industry-standard force simulation library. Mature, well-documented, handles thousands of nodes. Works in 3D with custom force functions. |
| **Rapier Physics Engine** | WebAssembly physics engine for collision detection. Prevents node overlap. Faster than JavaScript-only physics. |
| **Gemini 2.5 Flash** | Fast, cheap text embedding model (768 dims). Better semantic understanding than older embedding models (Word2Vec, GloVe). API-first—no local model hosting. |
| **ChromaDB** | Vector database with built-in similarity search. Persistent storage for embeddings. Python/JavaScript interop. |
| **HDBSCAN** | Density-based clustering that doesn't require pre-specifying cluster count. Finds natural thematic groupings. Works well with high-dimensional embeddings. |
| **Zustand** | Lightweight state management. Graph state (nodes, edges, camera position) needs to be globally accessible. Zustand avoids Redux boilerplate. |
| **TypeScript** | Type safety for complex 3D coordinate transformations and vector operations. Prevents runtime errors when mapping semantic space to visual space. |

## 6. Artifacts

**Architecture Diagram:**
```
Text Documents
    ↓
Gemini 2.5 (Embedding API)
    ↓
768-Dimensional Vectors
    ↓
ChromaDB (Vector Store)
    ↓
HDBSCAN Clustering
    ↓
Thematic Regions
    ↓
D3-Force Simulation
    ↓
3D Node Positions
    ↓
Rapier Physics (Collision)
    ↓
React Three Fiber (Rendering)
    ↓
Interactive 3D Constellation
```

**Key Code Excerpts:**

```typescript
// Force-directed layout with semantic similarity as edge weight
const simulation = forceSimulation(nodes)
  .force('charge', forceManyBody().strength(-30)) // Repulsion
  .force('link', forceLink(edges).strength(link => link.similarity)) // Semantic attraction
  .force('center', forceCenter(0, 0, 0)) // Keep constellation centered
  .force('collision', forceCollide().radius(10)); // Prevent overlap

// Update positions on each physics tick
simulation.on('tick', () => {
  updateNodePositions(simulation.nodes());
});
```

```typescript
// Semantic search: find nodes closest to query embedding
async function semanticSearch(query: string): Promise<Node[]> {
  const queryEmbedding = await getEmbedding(query);

  const results = await chromaDB.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 10
  });

  // Highlight matching nodes in 3D space
  highlightNodes(results.ids);

  return results;
}
```

```typescript
// Color-code clusters based on HDBSCAN output
const clusters = hdbscan(embeddings, {
  minClusterSize: 5,
  minSamples: 3
});

nodes.forEach((node, i) => {
  node.color = clusterColors[clusters.labels[i]];
  node.cluster = clusters.labels[i];
});
```

**Interface Definitions:**
```typescript
interface Node {
  id: string;
  position: [number, number, number]; // X, Y, Z in 3D space
  embedding: number[]; // 768-dim vector
  metadata: {
    title: string;
    author?: string;
    year?: number;
    genre?: string;
  };
  cluster: number; // HDBSCAN cluster ID
  color: string; // Cluster color
}

interface Edge {
  source: string; // Node ID
  target: string; // Node ID
  similarity: number; // Cosine similarity (0-1)
}

interface Constellation {
  nodes: Node[];
  edges: Edge[];
  clusters: ClusterInfo[];
}
```

## 7. Failure Modes & Limits

**What breaks:**
- **Large libraries** (>5000 documents) → Physics simulation slows to unusable frame rates. Need spatial partitioning or level-of-detail optimization.
- **Low-quality embeddings** → If source text is too short (<100 words), embeddings lack semantic richness. Clustering degrades to randomness.
- **Rapid document additions** → Adding many documents at once destabilizes the force simulation. Nodes "explode" outward and take time to re-settle.
- **Browser memory limits** → Each node stores a 768-dimensional vector. Memory usage scales linearly with document count. Browser tabs crash beyond ~10k nodes.

**What scales poorly:**
- **Multi-user editing**: No conflict resolution for concurrent graph mutations. Single-user only.
- **Version history**: No snapshots or rewind functionality. Graph state is ephemeral.
- **Mobile devices**: 3D rendering + physics simulation drain battery and overheat phones. Desktop-first design.

**What was consciously deferred:**
- **Automatic document ingestion**: No web scraping or email parsing. User must manually add documents. Keeps graph curated.
- **Social/sharing features**: No public graphs or collaborative constellations. This is a personal memory palace.
- **Export to standard formats**: No RDF, no OWL, no knowledge graph standards. Intentionally non-interoperable with corporate knowledge management systems.
- **Search analytics**: No logging of which queries users run. Privacy-first design.

**What would require architectural changes:**
- **Real-time collaboration**: Would need CRDT or OT for conflict-free state synchronization
- **Offline-first**: Would need local embedding model (TensorFlow.js) but quality degrades significantly
- **Million-node scale**: Would need hierarchical clustering and spatial indexing (octree, BVH)

## 8. Background & Context

This system emerged from:
- **Personal library chaos**: 1500+ books with no organizing principle beyond "I bought this once." Alphabet and genre failed to surface thematic connections.
- **Displacement experience**: Memories organized by emotional weight, not calendar dates. Wanted a tool that reflected that associative logic.
- **Research at The Bartlett**: Studying how architecture coordinates attention through spatial relationships. Applied those principles to information architecture.
- **Frustration with Goodreads/Notion**: Linear lists and hierarchical folders force false categorization. Needed a non-hierarchical structure.

It synthesizes:
- **Spatial memory research**: How humans encode episodic memory as spatial relationships (hippocampal place cells)
- **Force-directed graphs**: Network visualization technique from graph theory
- **Vector embeddings**: NLP technique for semantic similarity
- **Physics simulation**: Game engine physics repurposed for knowledge visualization

**Current Status:**
- **Active Development** (2024–)
- Deployed at [demo URL] with ~800 books
- Used daily for personal knowledge management
- Open to testers and collaborators

**Future Directions:**
- Integration with DERIVE for generative recall (query constellation → generate new text from clusters)
- Connection to hah-was for adversarial fact-checking (verify book claims against grounded search)
- Workshop curriculum for teaching spatial knowledge organization

---

**Maintained by:** [Haig Papazian](https://github.com/haigpapa) / [Walaw Studio](https://walaw.studio)
**Repository:** [github.com/haigpapa/STORYLINES](https://github.com/haigpapa/STORYLINES)
**License:** MIT (See LICENSE)
