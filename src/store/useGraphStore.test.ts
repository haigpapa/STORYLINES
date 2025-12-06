import { describe, it, expect, beforeEach } from 'vitest';
import { useGraphStore } from './useGraphStore';

describe('useGraphStore', () => {
    beforeEach(() => {
        useGraphStore.getState().clearGraph();
        useGraphStore.getState().setSelectedNode(null);
    });

    it('should add a node', () => {
        const node = { id: '1', type: 'book', label: 'Test Node', x: 0, y: 0 };
        useGraphStore.getState().addNode(node as any);

        const { graph } = useGraphStore.getState();
        expect(graph.nodes).toHaveLength(1);
        expect(graph.nodes[0]).toEqual(node);
    });

    it('should remove a node', () => {
        const node = { id: '1', type: 'book', label: 'Test Node' };
        useGraphStore.getState().addNode(node as any);
        useGraphStore.getState().removeNode('1');

        const { graph } = useGraphStore.getState();
        expect(graph.nodes).toHaveLength(0);
    });

    it('should select a node', () => {
        useGraphStore.getState().setSelectedNode('123');
        expect(useGraphStore.getState().selectedNodeId).toBe('123');
    });

    it('should add an edge', () => {
        const edge = { id: 'e1', source: 'n1', target: 'n2' };
        useGraphStore.getState().addEdge(edge as any);

        const { graph } = useGraphStore.getState();
        expect(graph.edges).toHaveLength(1);
        expect(graph.edges[0]).toEqual(edge);
    });
});
