import React, { useEffect, useState } from 'react';
import { X, Sparkles, Book, Users, Tag, Loader, Bookmark, Plus } from 'lucide-react';
import { useGraphStore } from '../../store/useGraphStore';
import { geminiService } from '../../services/geminiService';
import { openLibraryService } from '../../services/openLibraryService';
import { AIEnrichmentResponse, GraphNode, GraphEdge } from '../../types';

export const NodeInfoPanel: React.FC = () => {
  const selectedNodeId = useGraphStore((state) => state.selectedNodeId);
  const graph = useGraphStore((state) => state.graph);
  const setSelectedNode = useGraphStore((state) => state.setSelectedNode);
  const addNodes = useGraphStore((state) => state.addNodes);
  const addEdges = useGraphStore((state) => state.addEdges);
  const addToReadingList = useGraphStore((state) => state.addToReadingList);
  const addBookmark = useGraphStore((state) => state.addBookmark);
  const addJournalEntry = useGraphStore((state) => state.addJournalEntry);

  const [enrichment, setEnrichment] = useState<AIEnrichmentResponse | null>(null);
  const [isLoadingEnrichment, setIsLoadingEnrichment] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId);

  useEffect(() => {
    if (!selectedNode) {
      setEnrichment(null);
      return;
    }

    // Load AI enrichment if Gemini is initialized
    if (geminiService.isInitialized() && !selectedNode.metadata.aiInsight) {
      loadEnrichment(selectedNode);
    } else if (selectedNode.metadata.aiInsight) {
      setEnrichment({
        nodeId: selectedNode.id,
        insight: selectedNode.metadata.aiInsight,
        relatedConcepts: [],
        connections: [],
      });
    }
  }, [selectedNodeId]);

  const loadEnrichment = async (node: GraphNode) => {
    setIsLoadingEnrichment(true);
    try {
      const result = await geminiService.enrichNode(node);
      if (result) {
        setEnrichment(result);
        addJournalEntry({
          type: 'info',
          message: `Generated AI insight for "${node.label}"`,
        });
      }
    } catch (error) {
      console.error('Failed to load enrichment:', error);
    } finally {
      setIsLoadingEnrichment(false);
    }
  };

  const handleExpand = async () => {
    if (!selectedNode) return;

    setIsExpanding(true);
    addJournalEntry({
      type: 'info',
      message: `Expanding node: "${selectedNode.label}"`,
    });

    try {
      const newNodes: GraphNode[] = [];
      const newEdges: GraphEdge[] = [];

      // Expand based on node type
      if (selectedNode.type === 'author') {
        // Fetch author's works
        const authorId = selectedNode.metadata.openLibraryId || selectedNode.id;
        const works = await openLibraryService.getAuthorWorks(
          authorId.replace('/authors/', ''),
          10
        );

        works.forEach((work, index) => {
          const bookNode: GraphNode = {
            id: work.key || `work-${selectedNode.id}-${index}`,
            type: 'book',
            label: work.title,
            metadata: {
              year: work.first_publish_year,
              openLibraryId: work.key,
            },
            expanded: false,
            depth: selectedNode.depth + 1,
          };

          newNodes.push(bookNode);
          newEdges.push({
            id: `edge-${selectedNode.id}-${bookNode.id}`,
            source: selectedNode.id,
            target: bookNode.id,
            type: 'wrote',
            strength: 1.0,
          });
        });
      } else if (selectedNode.type === 'book') {
        // Add genres and themes as nodes
        const genres = selectedNode.metadata.genres || selectedNode.metadata.categories || [];
        const themes = selectedNode.metadata.subjects || selectedNode.metadata.themes || [];

        genres.slice(0, 3).forEach((genre: string, index: number) => {
          const genreNode: GraphNode = {
            id: `genre-${genre.toLowerCase().replace(/\s+/g, '-')}`,
            type: 'genre',
            label: genre,
            metadata: {},
            expanded: false,
            depth: selectedNode.depth + 1,
          };

          // Check if genre node already exists
          if (!graph.nodes.find((n) => n.id === genreNode.id)) {
            newNodes.push(genreNode);
          }

          newEdges.push({
            id: `edge-${selectedNode.id}-${genreNode.id}`,
            source: selectedNode.id,
            target: genreNode.id,
            type: 'belongs_to',
            strength: 0.8,
          });
        });

        themes.slice(0, 3).forEach((theme: string, index: number) => {
          const themeNode: GraphNode = {
            id: `theme-${theme.toLowerCase().replace(/\s+/g, '-')}`,
            type: 'theme',
            label: theme,
            metadata: {},
            expanded: false,
            depth: selectedNode.depth + 1,
          };

          if (!graph.nodes.find((n) => n.id === themeNode.id)) {
            newNodes.push(themeNode);
          }

          newEdges.push({
            id: `edge-${selectedNode.id}-${themeNode.id}`,
            source: selectedNode.id,
            target: themeNode.id,
            type: 'features',
            strength: 0.6,
          });
        });
      } else if (selectedNode.type === 'genre' || selectedNode.type === 'theme') {
        // Find related books
        const subjectBooks = await openLibraryService.getSubjectBooks(
          selectedNode.label.toLowerCase(),
          5
        );

        subjectBooks.forEach((work, index) => {
          const bookNode: GraphNode = {
            id: work.key || `book-${selectedNode.id}-${index}`,
            type: 'book',
            label: work.title,
            metadata: {
              authors: work.authors?.map((a: any) => a.name) || [],
              openLibraryId: work.key,
            },
            expanded: false,
            depth: selectedNode.depth + 1,
          };

          newNodes.push(bookNode);
          newEdges.push({
            id: `edge-${bookNode.id}-${selectedNode.id}`,
            source: bookNode.id,
            target: selectedNode.id,
            type: 'belongs_to',
            strength: 0.7,
          });
        });
      }

      if (newNodes.length > 0) {
        addNodes(newNodes);
        addEdges(newEdges);
        addJournalEntry({
          type: 'milestone',
          message: `Expanded "${selectedNode.label}": added ${newNodes.length} nodes, ${newEdges.length} connections`,
        });
      }
    } catch (error) {
      console.error('Failed to expand node:', error);
      addJournalEntry({
        type: 'technical',
        message: `Failed to expand "${selectedNode.label}": ${error}`,
      });
    } finally {
      setIsExpanding(false);
    }
  };

  const handleAddToReadingList = () => {
    if (!selectedNode) return;
    addToReadingList({
      nodeId: selectedNode.id,
      addedAt: new Date(),
      status: 'to_read',
    });
    addJournalEntry({
      type: 'info',
      message: `Added "${selectedNode.label}" to reading list`,
    });
  };

  const handleBookmark = () => {
    if (!selectedNode) return;
    addBookmark({
      id: `bookmark-${selectedNode.id}-${Date.now()}`,
      nodeId: selectedNode.id,
      createdAt: new Date(),
      tags: [selectedNode.type],
    });
    addJournalEntry({
      type: 'info',
      message: `Bookmarked "${selectedNode.label}"`,
    });
  };

  if (!selectedNode) return null;

  return (
    <div className="absolute top-4 right-4 w-96 max-h-[calc(100vh-2rem)] overflow-y-auto z-10">
      <div className="card p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium bg-literary-${selectedNode.type}/20 text-literary-${selectedNode.type}`}
              >
                {selectedNode.type}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{selectedNode.label}</h2>
            {selectedNode.metadata.authors?.[0] && (
              <p className="text-sm text-slate-400 mt-1">
                by {selectedNode.metadata.authors[0]}
              </p>
            )}
            {selectedNode.metadata.year && (
              <p className="text-xs text-slate-500">{selectedNode.metadata.year}</p>
            )}
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cover image */}
        {selectedNode.metadata.imageUrl && (
          <img
            src={selectedNode.metadata.imageUrl}
            alt={selectedNode.label}
            className="w-full rounded-lg"
          />
        )}

        {/* Description */}
        {selectedNode.metadata.description && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Description</h3>
            <p className="text-sm text-slate-400 line-clamp-4">
              {typeof selectedNode.metadata.description === 'string'
                ? selectedNode.metadata.description
                : selectedNode.metadata.description.value}
            </p>
          </div>
        )}

        {/* AI Insight */}
        <div className="border-t border-slate-700 pt-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            AI Insight
          </h3>
          {isLoadingEnrichment ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader className="w-4 h-4 animate-spin" />
              Generating insights...
            </div>
          ) : enrichment ? (
            <p className="text-sm text-slate-300">{enrichment.insight}</p>
          ) : (
            <p className="text-sm text-slate-500 italic">
              AI enrichment not available
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleExpand}
            disabled={isExpanding || selectedNode.expanded}
            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isExpanding ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Expand
          </button>
          {selectedNode.type === 'book' && (
            <button
              onClick={handleAddToReadingList}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <Book className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleBookmark}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Metadata */}
        {(selectedNode.metadata.genres || selectedNode.metadata.subjects) && (
          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {(selectedNode.metadata.genres || selectedNode.metadata.subjects || [])
                .slice(0, 5)
                .map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
