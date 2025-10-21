import { useState, useCallback } from 'react';
import { Search, Book, User, X, Loader } from 'lucide-react';
import { openLibraryService } from '../../services/openLibraryService';
import { googleBooksService } from '../../services/googleBooksService';
import { useGraphStore } from '../../store/useGraphStore';
import type { SearchResult, GraphNode } from '../../types';

export const SearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'books' | 'authors' | 'themes'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isSearchOpen = useGraphStore((state) => state.isSearchOpen);
  const toggleSearch = useGraphStore((state) => state.toggleSearch);
  const addNode = useGraphStore((state) => state.addNode);
  const addJournalEntry = useGraphStore((state) => state.addJournalEntry);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    addJournalEntry({
      type: 'info',
      message: `Searching for: "${query}" (type: ${searchType})`,
    });

    try {
      let searchResults: SearchResult[] = [];

      if (searchType === 'all' || searchType === 'books') {
        const olResults = await openLibraryService.searchBooks(query, 5);
        const gbResults = await googleBooksService.searchBooks(query, 5);
        searchResults = [...olResults, ...gbResults];
      }

      if (searchType === 'all' || searchType === 'authors') {
        const authorResults = await openLibraryService.searchAuthors(query);
        searchResults = [...searchResults, ...authorResults];
      }

      // Remove duplicates based on title similarity
      const uniqueResults = searchResults.filter(
        (result, index, self) =>
          index ===
          self.findIndex(
            (r) =>
              r.title.toLowerCase().trim() === result.title.toLowerCase().trim() &&
              r.type === result.type
          )
      );

      setResults(uniqueResults.slice(0, 15));

      addJournalEntry({
        type: 'info',
        message: `Found ${uniqueResults.length} results for "${query}"`,
      });
    } catch (error) {
      console.error('Search error:', error);
      addJournalEntry({
        type: 'technical',
        message: `Search failed: ${error}`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [query, searchType, addJournalEntry]);

  const handleAddNode = useCallback(
    (result: SearchResult) => {
      const node: GraphNode = {
        id: result.id,
        type: result.type,
        label: result.title,
        metadata: {
          ...result.metadata,
          description: result.description,
          year: result.year,
          imageUrl: result.coverUrl,
          authors: result.author ? [result.author] : [],
        },
        expanded: false,
        depth: 0,
      };

      addNode(node);

      addJournalEntry({
        type: 'info',
        message: `Added ${result.type}: "${result.title}" to graph`,
      });

      setResults([]);
      setQuery('');
    },
    [addNode, addJournalEntry]
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="absolute top-4 left-4 w-96 z-10">
      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Literary Universe
          </h2>
          <button
            onClick={toggleSearch}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search type selector */}
        <div className="flex gap-2">
          {(['all', 'books', 'authors', 'themes'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                searchType === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for books, authors, themes..."
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary px-3 py-1 text-sm disabled:opacity-50"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600 cursor-pointer transition-colors"
                onClick={() => handleAddNode(result)}
              >
                <div className="flex items-start gap-3">
                  {result.coverUrl ? (
                    <img
                      src={result.coverUrl}
                      alt={result.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-slate-800 rounded flex items-center justify-center">
                      {result.type === 'author' ? (
                        <User className="w-6 h-6 text-slate-500" />
                      ) : (
                        <Book className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white truncate">{result.title}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          result.type === 'author'
                            ? 'bg-literary-author/20 text-literary-author'
                            : 'bg-literary-book/20 text-literary-book'
                        }`}
                      >
                        {result.type}
                      </span>
                    </div>
                    {result.author && (
                      <p className="text-sm text-slate-400">{result.author}</p>
                    )}
                    {result.year && (
                      <p className="text-xs text-slate-500">{result.year}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick start suggestions */}
        {results.length === 0 && !isLoading && (
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Try searching for:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Shakespeare',
                'Science Fiction',
                '1984',
                'Jane Austen',
                'Modernism',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    setTimeout(() => handleSearch(), 100);
                  }}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-slate-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
