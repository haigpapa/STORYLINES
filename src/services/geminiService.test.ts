import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from './geminiService';

// Mock the Google Generative AI library
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
    generateContent: mockGenerateContent,
}));

vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: class {
            getGenerativeModel = mockGetGenerativeModel;
        },
    };
});

describe('GeminiService', () => {
    let service: GeminiService;

    beforeEach(() => {
        service = new GeminiService();
        vi.clearAllMocks();
    });

    it('should initialize correctly', () => {
        service.initialize('fake-api-key');
        expect(service.isInitialized()).toBe(true);
    });

    it('should fail gracefully if not initialized', async () => {
        const node = { id: '1', type: 'book', label: 'Test Book' } as any;
        const result = await service.enrichNode(node);
        expect(result).toBeNull();
    });

    it('should enrich a node successfully', async () => {
        service.initialize('fake-key');

        const mockResponseText = JSON.stringify({
            insight: 'Test insight',
            relatedConcepts: ['Concept A'],
            connections: [],
        });

        mockGenerateContent.mockResolvedValueOnce({
            response: {
                text: () => mockResponseText,
            },
        });

        const node = { id: '1', type: 'book', label: 'Test Book' } as any;
        const result = await service.enrichNode(node);

        expect(result).not.toBeNull();
        expect(result?.insight).toBe('Test insight');
        expect(result?.relatedConcepts).toContain('Concept A');
    });

    it('should handle API errors gracefully', async () => {
        service.initialize('fake-key');

        mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

        const node = { id: '1', type: 'book', label: 'Test Book' } as any;
        const result = await service.enrichNode(node);

        expect(result).toBeNull();
    });
});
