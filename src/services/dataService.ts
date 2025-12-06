import type { Graph } from '../types';

export interface ExportData {
    version: number;
    timestamp: string;
    graph: Graph;
    schema: 'storylines-v1';
}

export const dataService = {
    /**
     * Serializes the graph data for export
     */
    exportGraph(graph: Graph): string {
        const exportData: ExportData = {
            version: 1,
            timestamp: new Date().toISOString(),
            schema: 'storylines-v1',
            graph: {
                nodes: graph.nodes.map(n => ({
                    ...n,
                    // Ensure we don't export D3 internal simulation properties if they exist
                    x: undefined,
                    y: undefined,
                    vx: undefined,
                    vy: undefined,
                    fx: undefined,
                    fy: undefined
                })),
                edges: graph.edges
            }
        };
        return JSON.stringify(exportData, null, 2);
    },

    /**
     * Validates if the parsed JSON is a valid graph export
     */
    validateImport(data: any): boolean {
        if (!data || typeof data !== 'object') return false;

        // Check basic structure
        if (!data.graph || !Array.isArray(data.graph.nodes) || !Array.isArray(data.graph.edges)) {
            return false;
        }

        // Basic node validation
        const hasValidNodes = data.graph.nodes.every((node: any) =>
            typeof node.id === 'string' &&
            typeof node.type === 'string' &&
            typeof node.label === 'string'
        );

        // Basic edge validation
        const hasValidEdges = data.graph.edges.every((edge: any) =>
            typeof edge.source === 'string' &&
            typeof edge.target === 'string'
        );

        return hasValidNodes && hasValidEdges;
    },

    /**
     * Imports graph data from a JSON string
     * Throws error if validation fails
     */
    importGraph(jsonString: string): Graph {
        try {
            const data = JSON.parse(jsonString);

            if (!this.validateImport(data)) {
                throw new Error('Invalid data format');
            }

            return data.graph;
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error('Invalid JSON');
            }
            throw error;
        }
    }
};
