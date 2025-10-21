import { useState } from 'react';
import {
  Search,
  FileText,
  Download,
  Upload,
  Trash2,
  BookMarked,
  X,
} from 'lucide-react';
import { useGraphStore } from '../../store/useGraphStore';
import { storageService } from '../../services/storageService';

export const Toolbar: React.FC = () => {
  const toggleSearch = useGraphStore((state) => state.toggleSearch);
  const toggleJournal = useGraphStore((state) => state.toggleJournal);
  const clearGraph = useGraphStore((state) => state.clearGraph);
  const graph = useGraphStore((state) => state.graph);
  const loadSession = useGraphStore((state) => state.loadSession);
  const addJournalEntry = useGraphStore((state) => state.addJournalEntry);

  const [showLists, setShowLists] = useState(false);

  const handleExport = async () => {
    try {
      const data = await storageService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `storylines-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      addJournalEntry({
        type: 'milestone',
        message: 'Exported graph data successfully',
      });
    } catch (error) {
      console.error('Export failed:', error);
      addJournalEntry({
        type: 'technical',
        message: `Export failed: ${error}`,
      });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await storageService.importData(data);

        if (data.session) {
          loadSession(data.session);
        }

        addJournalEntry({
          type: 'milestone',
          message: 'Imported graph data successfully',
        });
      } catch (error) {
        console.error('Import failed:', error);
        addJournalEntry({
          type: 'technical',
          message: `Import failed: ${error}`,
        });
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (
      graph.nodes.length > 0 &&
      !confirm('Are you sure you want to clear the entire graph?')
    ) {
      return;
    }
    clearGraph();
    addJournalEntry({
      type: 'info',
      message: 'Cleared graph',
    });
  };

  return (
    <>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="card p-2 flex items-center gap-2">
          <button
            onClick={toggleSearch}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Toggle Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-slate-700" />

          <button
            onClick={handleExport}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Export Graph"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={handleImport}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Import Graph"
          >
            <Upload className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-slate-700" />

          <button
            onClick={() => setShowLists(!showLists)}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Reading Lists & Bookmarks"
          >
            <BookMarked className="w-5 h-5" />
          </button>

          <button
            onClick={toggleJournal}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Toggle Dev Journal"
          >
            <FileText className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-slate-700" />

          <button
            onClick={handleClear}
            className="p-2 hover:bg-slate-700 rounded transition-colors text-red-400"
            title="Clear Graph"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="px-3 py-1 bg-slate-700 rounded text-sm">
            {graph.nodes.length} nodes
          </div>
        </div>
      </div>

      {showLists && <ListsPanel onClose={() => setShowLists(false)} />}
    </>
  );
};

const ListsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const readingList = useGraphStore((state) => state.readingList);
  const bookmarks = useGraphStore((state) => state.bookmarks);
  const graph = useGraphStore((state) => state.graph);

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-96 max-h-96 overflow-y-auto z-20">
      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Reading List & Bookmarks</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">
            Reading List ({readingList.length})
          </h3>
          {readingList.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No items in reading list</p>
          ) : (
            <div className="space-y-1">
              {readingList.map((item) => {
                const node = graph.nodes.find((n) => n.id === item.nodeId);
                return (
                  <div
                    key={item.nodeId}
                    className="p-2 bg-slate-700 rounded text-sm"
                  >
                    {node?.label || item.nodeId}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">
            Bookmarks ({bookmarks.length})
          </h3>
          {bookmarks.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No bookmarks</p>
          ) : (
            <div className="space-y-1">
              {bookmarks.map((bookmark) => {
                const node = graph.nodes.find((n) => n.id === bookmark.nodeId);
                return (
                  <div key={bookmark.id} className="p-2 bg-slate-700 rounded text-sm">
                    {node?.label || bookmark.nodeId}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
