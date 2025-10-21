import * as d3 from 'd3';
import { GraphNode, GraphEdge, NodeType, Graph } from '../types';

export interface GraphEngineConfig {
  width: number;
  height: number;
  nodeRadius: number;
  linkDistance: number;
  chargeStrength: number;
  enableCollision: boolean;
}

export class GraphEngine {
  private simulation: d3.Simulation<GraphNode, GraphEdge> | null = null;
  private config: GraphEngineConfig;

  constructor(config: Partial<GraphEngineConfig> = {}) {
    this.config = {
      width: 1200,
      height: 800,
      nodeRadius: 8,
      linkDistance: 100,
      chargeStrength: -300,
      enableCollision: true,
      ...config,
    };
  }

  initialize(nodes: GraphNode[], edges: GraphEdge[]): void {
    // Create the simulation
    this.simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphEdge>(edges)
          .id((d) => d.id)
          .distance((d) => {
            // Vary distance based on edge type and node depth
            const baseDistance = this.config.linkDistance;
            return baseDistance * (1 + d.strength * 0.5);
          })
      )
      .force('charge', d3.forceManyBody().strength(this.config.chargeStrength))
      .force('center', d3.forceCenter(this.config.width / 2, this.config.height / 2))
      .force('x', d3.forceX(this.config.width / 2).strength(0.05))
      .force('y', d3.forceY(this.config.height / 2).strength(0.05));

    if (this.config.enableCollision) {
      this.simulation.force(
        'collision',
        d3.forceCollide<GraphNode>().radius((d) => this.getNodeRadius(d) + 4)
      );
    }

    // Add radial force for better organization
    this.simulation.force(
      'radial',
      d3
        .forceRadial<GraphNode>(
          (d) => d.depth * 150,
          this.config.width / 2,
          this.config.height / 2
        )
        .strength(0.3)
    );
  }

  updateGraph(nodes: GraphNode[], edges: GraphEdge[]): void {
    if (!this.simulation) {
      this.initialize(nodes, edges);
      return;
    }

    // Update nodes
    this.simulation.nodes(nodes);

    // Update links
    const linkForce = this.simulation.force<d3.ForceLink<GraphNode, GraphEdge>>('link');
    if (linkForce) {
      linkForce.links(edges);
    }

    // Restart simulation
    this.simulation.alpha(0.3).restart();
  }

  onTick(callback: () => void): void {
    this.simulation?.on('tick', callback);
  }

  onEnd(callback: () => void): void {
    this.simulation?.on('end', callback);
  }

  start(): void {
    this.simulation?.restart();
  }

  stop(): void {
    this.simulation?.stop();
  }

  reheat(): void {
    this.simulation?.alpha(0.5).restart();
  }

  getNodeRadius(node: GraphNode): number {
    const baseRadius = this.config.nodeRadius;
    const typeMultiplier = this.getNodeTypeMultiplier(node.type);
    const depthMultiplier = 1 + (3 - node.depth) * 0.2;
    return baseRadius * typeMultiplier * depthMultiplier;
  }

  private getNodeTypeMultiplier(type: NodeType): number {
    const multipliers: Record<NodeType, number> = {
      author: 1.3,
      book: 1.0,
      genre: 1.1,
      theme: 0.9,
      character: 0.8,
      movement: 1.2,
    };
    return multipliers[type] || 1.0;
  }

  getNodeColor(type: NodeType): string {
    const colors: Record<NodeType, string> = {
      author: '#8b5cf6',
      book: '#3b82f6',
      genre: '#10b981',
      theme: '#f59e0b',
      character: '#ef4444',
      movement: '#ec4899',
    };
    return colors[type] || '#6b7280';
  }

  findNodeAt(x: number, y: number, nodes: GraphNode[]): GraphNode | null {
    for (const node of nodes) {
      if (!node.x || !node.y) continue;

      const dx = x - node.x;
      const dy = y - node.y;
      const radius = this.getNodeRadius(node);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        return node;
      }
    }
    return null;
  }

  dragStarted(node: GraphNode, event: any): void {
    if (!this.simulation) return;
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    node.fx = node.x;
    node.fy = node.y;
  }

  dragged(node: GraphNode, event: any): void {
    node.fx = event.x;
    node.fy = event.y;
  }

  dragEnded(node: GraphNode, event: any): void {
    if (!this.simulation) return;
    if (!event.active) this.simulation.alphaTarget(0);
    // Optionally release the node
    // node.fx = null;
    // node.fy = null;
  }

  // Apply clustering force for similar node types
  applyTypeClustering(enable: boolean = true): void {
    if (!this.simulation) return;

    if (enable) {
      const typePositions: Record<NodeType, { x: number; y: number }> = {
        author: { x: this.config.width * 0.3, y: this.config.height * 0.3 },
        book: { x: this.config.width * 0.7, y: this.config.height * 0.3 },
        genre: { x: this.config.width * 0.5, y: this.config.height * 0.7 },
        theme: { x: this.config.width * 0.5, y: this.config.height * 0.5 },
        character: { x: this.config.width * 0.2, y: this.config.height * 0.6 },
        movement: { x: this.config.width * 0.8, y: this.config.height * 0.6 },
      };

      this.simulation.force(
        'cluster',
        d3
          .forceX<GraphNode>((d) => typePositions[d.type].x)
          .strength(0.1)
      );
      this.simulation.force(
        'cluster-y',
        d3
          .forceY<GraphNode>((d) => typePositions[d.type].y)
          .strength(0.1)
      );
    } else {
      this.simulation.force('cluster', null);
      this.simulation.force('cluster-y', null);
    }

    this.reheat();
  }

  updateConfig(config: Partial<GraphEngineConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.simulation) {
      this.simulation
        .force('charge', d3.forceManyBody().strength(this.config.chargeStrength))
        .force('center', d3.forceCenter(this.config.width / 2, this.config.height / 2));
      this.reheat();
    }
  }

  destroy(): void {
    this.simulation?.stop();
    this.simulation = null;
  }
}
