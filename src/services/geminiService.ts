import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIEnrichmentResponse, GraphNode } from '../types';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private cache: Map<string, AIEnrichmentResponse> = new Map();

  initialize(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  isInitialized(): boolean {
    return this.model !== null;
  }

  async enrichNode(node: GraphNode, context: string = ''): Promise<AIEnrichmentResponse | null> {
    if (!this.model) {
      console.warn('Gemini API not initialized');
      return null;
    }

    const cacheKey = `${node.id}-${node.type}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const prompt = this.buildEnrichmentPrompt(node, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response
      const enrichment = this.parseEnrichmentResponse(node.id, text);
      this.cache.set(cacheKey, enrichment);
      return enrichment;
    } catch (error) {
      console.error('Gemini enrichment error:', error);
      return null;
    }
  }

  private buildEnrichmentPrompt(node: GraphNode, context: string): string {
    const basePrompt = `You are a literary scholar analyzing connections in literature.
Analyze this ${node.type}: "${node.label}"`;

    const contextPrompt = context ? `\n\nContext: ${context}` : '';

    const taskPrompt = `\n\nProvide:
1. A concise insight (2-3 sentences) about this ${node.type}'s significance and influence
2. Related concepts or themes (list 3-5)
3. Potential connections to other works, authors, or movements (list 3-5 with brief explanations)

Format your response as JSON:
{
  "insight": "your insight here",
  "relatedConcepts": ["concept1", "concept2", ...],
  "connections": [
    {"target": "name", "relationship": "type", "explanation": "brief explanation"},
    ...
  ]
}`;

    return basePrompt + contextPrompt + taskPrompt;
  }

  private parseEnrichmentResponse(nodeId: string, text: string): AIEnrichmentResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          nodeId,
          insight: parsed.insight || text.substring(0, 200),
          relatedConcepts: parsed.relatedConcepts || [],
          connections: (parsed.connections || []).map((conn: any) => ({
            targetId: `ai-suggestion-${Math.random()}`,
            relationship: conn.relationship || 'related',
            explanation: conn.explanation || '',
          })),
        };
      }
    } catch (error) {
      console.error('Failed to parse Gemini response as JSON:', error);
    }

    // Fallback: use the text as-is
    return {
      nodeId,
      insight: text.substring(0, 300),
      relatedConcepts: [],
      connections: [],
    };
  }

  async generateSummary(nodes: GraphNode[]): Promise<string> {
    if (!this.model || nodes.length === 0) return '';

    try {
      const nodeDescriptions = nodes
        .slice(0, 10)
        .map((n) => `${n.type}: ${n.label}`)
        .join(', ');

      const prompt = `Provide a brief summary (2-3 sentences) of the literary connections represented by these items: ${nodeDescriptions}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini summary error:', error);
      return '';
    }
  }

  async suggestRelatedNodes(
    node: GraphNode,
    existingNodes: GraphNode[]
  ): Promise<string[]> {
    if (!this.model) return [];

    try {
      const existingList = existingNodes
        .slice(0, 5)
        .map((n) => n.label)
        .join(', ');

      const prompt = `Given this ${node.type} "${node.label}" and existing items [${existingList}], suggest 5 related literary items (books, authors, themes, or genres) that would create interesting connections. List only names, one per line.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text
        .split('\n')
        .filter((line: string) => line.trim())
        .slice(0, 5);
    } catch (error) {
      console.error('Gemini suggestions error:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const geminiService = new GeminiService();
