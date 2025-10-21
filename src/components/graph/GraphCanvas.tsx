import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { GraphEngine } from '../../lib/graphEngine';
import { useGraphStore } from '../../store/useGraphStore';
import { GraphNode } from '../../types';

interface GraphCanvasProps {
  onNodeClick?: (node: GraphNode) => void;
  onNodeDoubleClick?: (node: GraphNode) => void;
  onCanvasClick?: () => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  onNodeClick,
  onNodeDoubleClick,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GraphEngine | null>(null);
  const transformRef = useRef(d3.zoomIdentity);

  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  const graph = useGraphStore((state) => state.graph);
  const selectedNodeId = useGraphStore((state) => state.selectedNodeId);
  const hoveredNodeId = useGraphStore((state) => state.hoveredNodeId);
  const setHoveredNode = useGraphStore((state) => state.setHoveredNode);
  const setSelectedNode = useGraphStore((state) => state.setSelectedNode);

  // Initialize graph engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new GraphEngine({
        width: dimensions.width,
        height: dimensions.height,
      });
    }

    return () => {
      engineRef.current?.destroy();
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
        engineRef.current?.updateConfig({ width: clientWidth, height: clientHeight });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update canvas resolution for crisp rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, [dimensions]);

  // Update graph when data changes
  useEffect(() => {
    if (!engineRef.current) return;

    engineRef.current.updateGraph(graph.nodes, graph.edges);
    engineRef.current.onTick(() => {
      render();
    });
  }, [graph.nodes, graph.edges]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const engine = engineRef.current;

    if (!canvas || !ctx || !engine) return;

    const transform = transformRef.current;

    // Clear canvas
    ctx.save();
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Apply zoom transform
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    // Draw edges
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;

    graph.edges.forEach((edge) => {
      const source = graph.nodes.find((n) => n.id === edge.source);
      const target = graph.nodes.find((n) => n.id === edge.target);

      if (!source || !target || !source.x || !source.y || !target.x || !target.y) {
        return;
      }

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    });

    ctx.globalAlpha = 1;

    // Draw nodes
    graph.nodes.forEach((node) => {
      if (!node.x || !node.y) return;

      const radius = engine.getNodeRadius(node);
      const color = engine.getNodeColor(node.type);

      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);

      // Fill
      ctx.fillStyle = color;
      ctx.fill();

      // Stroke for selected or hovered nodes
      if (node.id === selectedNodeId) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (node.id === hoveredNodeId) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw label
      if (transform.k > 0.8) {
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(10, 12 / transform.k)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(
          node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label,
          node.x,
          node.y + radius + 4
        );
      }
    });

    ctx.restore();
  }, [graph, dimensions, selectedNodeId, hoveredNodeId]);

  // Setup zoom behavior
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        transformRef.current = event.transform;
        render();
      });

    d3.select(canvas).call(zoom);

    return () => {
      d3.select(canvas).on('.zoom', null);
    };
  }, [render]);

  // Handle mouse interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const getMousePos = (event: MouseEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      const transform = transformRef.current;
      const x = (event.clientX - rect.left - transform.x) / transform.k;
      const y = (event.clientY - rect.top - transform.y) / transform.k;
      return [x, y];
    };

    let draggedNode: GraphNode | null = null;

    const handleMouseMove = (event: MouseEvent) => {
      if (draggedNode) return; // Skip hover detection while dragging

      const [x, y] = getMousePos(event);
      const node = engine.findNodeAt(x, y, graph.nodes);

      setHoveredNode(node?.id || null);
      canvas.style.cursor = node ? 'pointer' : 'grab';
    };

    const handleMouseDown = (event: MouseEvent) => {
      const [x, y] = getMousePos(event);
      const node = engine.findNodeAt(x, y, graph.nodes);

      if (node) {
        draggedNode = node;
        canvas.style.cursor = 'grabbing';
        engine.dragStarted(node, { x: node.x, y: node.y, active: true });
      }
    };

    const handleMouseDrag = (event: MouseEvent) => {
      if (!draggedNode) return;

      const [x, y] = getMousePos(event);
      engine.dragged(draggedNode, { x, y });
      render();
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (draggedNode) {
        engine.dragEnded(draggedNode, { active: false });
        draggedNode = null;
        canvas.style.cursor = 'grab';
      }
    };

    const handleClick = (event: MouseEvent) => {
      const [x, y] = getMousePos(event);
      const node = engine.findNodeAt(x, y, graph.nodes);

      if (node) {
        setSelectedNode(node.id);
        onNodeClick?.(node);
      } else {
        setSelectedNode(null);
        onCanvasClick?.();
      }
    };

    const handleDoubleClick = (event: MouseEvent) => {
      const [x, y] = getMousePos(event);
      const node = engine.findNodeAt(x, y, graph.nodes);

      if (node) {
        onNodeDoubleClick?.(node);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseDrag);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('dblclick', handleDoubleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseDrag);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [graph.nodes, onNodeClick, onNodeDoubleClick, onCanvasClick, render]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full bg-slate-950" />
      {graph.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-slate-400">
            <p className="text-lg">Start exploring by searching for a book, author, or theme</p>
          </div>
        </div>
      )}
    </div>
  );
};
