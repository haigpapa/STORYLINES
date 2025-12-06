import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NodeInfoPanel } from './NodeInfoPanel';
import { geminiService } from '../../services/geminiService';
import { openLibraryService } from '../../services/openLibraryService';

// Mock services
vi.mock('../../services/geminiService', () => ({
    geminiService: {
        isInitialized: vi.fn(),
        enrichNode: vi.fn(),
    },
}));

vi.mock('../../services/openLibraryService', () => ({
    openLibraryService: {
        getAuthorWorks: vi.fn(),
        getSubjectBooks: vi.fn(),
    },
}));

// Mock store
const mockSetSelectedNode = vi.fn();
const mockAddNodes = vi.fn();
const mockAddEdges = vi.fn();

// We need to be able to change the selected node for different tests
let mockSelectedNodeId: string | null = '1';
let mockGraphNodes = [
    {
        id: '1',
        type: 'book',
        label: 'Test Book',
        metadata: { description: 'A test book' },
        expanded: false
    }
];

vi.mock('../../store/useGraphStore', () => ({
    useGraphStore: (selector: any) => {
        const state = {
            selectedNodeId: mockSelectedNodeId,
            graph: { nodes: mockGraphNodes, edges: [] },
            setSelectedNode: mockSetSelectedNode,
            addNodes: mockAddNodes,
            addEdges: mockAddEdges,
            addToReadingList: vi.fn(),
            addBookmark: vi.fn(),
            addJournalEntry: vi.fn(),
        };
        return selector(state);
    },
}));

describe('NodeInfoPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSelectedNodeId = '1';
        (geminiService.isInitialized as any).mockReturnValue(false);
    });

    it('renders nothing when no node is selected', () => {
        mockSelectedNodeId = null;
        const { container } = render(<NodeInfoPanel />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders node details when a node is selected', () => {
        mockSelectedNodeId = '1';
        render(<NodeInfoPanel />);
        expect(screen.getByText('Test Book')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('calls expand handler when Expand button is clicked', async () => {
        mockSelectedNodeId = '2';
        // Add an author node for this test
        mockGraphNodes.push({
            id: '2',
            type: 'author',
            label: 'Test Author',
            metadata: { openLibraryId: '/authors/OL123' } as any,
            expanded: false
        });

        // Make the mock wait a bit so we can see the loading state if we wanted, 
        // or just verify the call.
        (openLibraryService.getAuthorWorks as any).mockResolvedValue([]);

        render(<NodeInfoPanel />);

        const expandBtn = screen.getByRole('button', { name: /expand/i });
        fireEvent.click(expandBtn);

        // Verify service was called
        expect(openLibraryService.getAuthorWorks).toHaveBeenCalled();
    });

    it('closes panel when close button is clicked', () => {
        mockSelectedNodeId = '1';
        render(<NodeInfoPanel />);

        // The close button is the X icon button in the header
        // It's the first button in the document order usually, but let's try to find it safely
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]); // First button is usually close in this layout

        expect(mockSetSelectedNode).toHaveBeenCalledWith(null);
    });
});
