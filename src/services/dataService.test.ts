import { describe, it, expect } from 'vitest';
import { dataService } from './dataService';
import type { Graph } from '../types';

describe('dataService', () => {
    const mockGraph: Graph = {
        nodes: [
            { id: '1', type: 'book', label: 'Test Book', expanded: false, metadata: {}, depth: 0 },
            { id: '2', type: 'author', label: 'Test Author', expanded: false, metadata: {}, depth: 0 }
        ],
        edges: [
            { id: 'e1', source: '2', target: '1', type: 'wrote', strength: 1 }
        ]
    };

    describe('exportGraph', () => {
        it('should serialize graph to valid JSON string', () => {
            const result = dataService.exportGraph(mockGraph);
            const parsed = JSON.parse(result);

            expect(parsed).toHaveProperty('version');
            expect(parsed).toHaveProperty('timestamp');
            expect(parsed.schema).toBe('storylines-v1');
            expect(parsed.graph.nodes).toHaveLength(2);
            expect(parsed.graph.edges).toHaveLength(1);
        });

        it('should strip D3 internal properties', () => {
            const graphWithD3: any = {
                nodes: [{ ...mockGraph.nodes[0], x: 100, y: 100, vx: 5 }],
                edges: mockGraph.edges
            };

            const result = dataService.exportGraph(graphWithD3);
            const parsed = JSON.parse(result);

            expect(parsed.graph.nodes[0].x).toBeUndefined();
            expect(parsed.graph.nodes[0].vx).toBeUndefined();
        });
    });

    describe('validateImport', () => {
        it('should return true for valid export data', () => {
            const validData = {
                graph: mockGraph
            };
            expect(dataService.validateImport(validData)).toBe(true);
        });

        it('should return false for missing graph property', () => {
            expect(dataService.validateImport({ nodes: [] })).toBe(false);
        });

        it('should return false for invalid node structure', () => {
            const invalidData = {
                graph: {
                    nodes: [{ id: '1' }], // Missing type/label
                    edges: []
                }
            };
            expect(dataService.validateImport(invalidData)).toBe(false);
        });
    });

    describe('importGraph', () => {
        it('should parse and return graph for valid JSON', () => {
            const json = JSON.stringify({ graph: mockGraph });
            const result = dataService.importGraph(json);
            expect(result).toEqual(mockGraph);
        });

        it('should throw error for invalid JSON', () => {
            expect(() => dataService.importGraph('{invalid}')).toThrow('Invalid JSON');
        });

        it('should throw error for invalid data structure', () => {
            const json = JSON.stringify({ graph: { nodes: 'not-array' } });
            expect(() => dataService.importGraph(json)).toThrow('Invalid data format');
        });
    });
});
