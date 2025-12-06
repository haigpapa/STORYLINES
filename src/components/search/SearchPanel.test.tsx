import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchPanel } from './SearchPanel';

// Mock services
vi.mock('../../services/openLibraryService', () => ({
    openLibraryService: {
        searchBooks: vi.fn(),
        searchAuthors: vi.fn(),
    },
}));

vi.mock('../../services/googleBooksService', () => ({
    googleBooksService: {
        searchBooks: vi.fn().mockResolvedValue([]),
    },
}));

// Mock store
const mockToggleSearch = vi.fn();
const mockAddNode = vi.fn();
const mockAddJournalEntry = vi.fn();

vi.mock('../../store/useGraphStore', () => ({
    useGraphStore: (selector: any) => {
        const state = {
            isSearchOpen: true,
            toggleSearch: mockToggleSearch,
            addNode: mockAddNode,
            addJournalEntry: mockAddJournalEntry,
        };
        return selector(state);
    },
}));

import { openLibraryService } from '../../services/openLibraryService';

describe('SearchPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly when open', () => {
        render(<SearchPanel />);
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
        expect(screen.getByText('Search Literary Universe')).toBeInTheDocument();
    });

    it('updates query state on input change', () => {
        render(<SearchPanel />);
        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'Dune' } });
        expect(input).toHaveValue('Dune');
    });

    it('performs search on button click', async () => {
        (openLibraryService.searchBooks as any).mockResolvedValue([
            { id: '1', title: 'Dune', type: 'book' },
        ]);
        (openLibraryService.searchAuthors as any).mockResolvedValue([]);

        render(<SearchPanel />);
        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'Dune' } });

        const button = screen.getByRole('button', { name: /search/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(openLibraryService.searchBooks).toHaveBeenCalledWith('Dune', 5);
            expect(screen.getByText('Dune')).toBeInTheDocument();
        });
    });

    it('adds node to graph when result is clicked', async () => {
        const mockResult = { id: '1', title: 'Dune', type: 'book', metadata: {} };
        (openLibraryService.searchBooks as any).mockResolvedValue([mockResult]);
        (openLibraryService.searchAuthors as any).mockResolvedValue([]);

        render(<SearchPanel />);

        // Perform search
        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'Dune' } });
        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        // Click result
        await waitFor(() => {
            const result = screen.getByText('Dune');
            fireEvent.click(result);
        });

        expect(mockAddNode).toHaveBeenCalled();
        expect(mockAddJournalEntry).toHaveBeenCalled();
    });
});
