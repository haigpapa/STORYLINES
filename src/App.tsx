import React, { useEffect, useState } from 'react';
import { GraphCanvas } from './components/graph/GraphCanvas';
import { SearchPanel } from './components/search/SearchPanel';
import { NodeInfoPanel } from './components/nodes/NodeInfoPanel';
import { DevJournal } from './components/journal/DevJournal';
import { Toolbar } from './components/ui/Toolbar';
import { Legend } from './components/ui/Legend';
import { useGraphStore } from './store/useGraphStore';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import { Sparkles } from 'lucide-react';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showApiPrompt, setShowApiPrompt] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const addJournalEntry = useGraphStore((state) => state.addJournalEntry);
  const expandNode = useGraphStore((state) => state.expandNode);

  useEffect(() => {
    const initialize = async () => {
      // Initialize storage
      await storageService.initialize();

      // Try to load the last session
      const session = await storageService.getLatestSession();
      if (session) {
        useGraphStore.getState().loadSession(session);
        addJournalEntry({
          type: 'milestone',
          message: 'Loaded previous session',
        });
      }

      // Add welcome journal entry
      addJournalEntry({
        type: 'milestone',
        message: 'Welcome to Storylines - AI-Powered Literary Exploration',
      });

      addJournalEntry({
        type: 'info',
        message: 'Search for books, authors, or themes to begin exploring',
      });

      setIsInitialized(true);
    };

    initialize();
  }, []);

  const handleNodeDoubleClick = (node: any) => {
    expandNode(node.id);
  };

  const handleSetupGemini = () => {
    if (geminiKey.trim()) {
      geminiService.initialize(geminiKey);
      setShowApiPrompt(false);
      addJournalEntry({
        type: 'technical',
        message: 'Gemini AI initialized - AI insights enabled',
      });
    }
  };

  if (!isInitialized) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-slate-400">Initializing Storylines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 pointer-events-none">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              Storylines
            </h1>
            <p className="text-sm text-slate-400">
              AI-Powered Literary Exploration
            </p>
          </div>

          {!geminiService.isInitialized() && (
            <button
              onClick={() => setShowApiPrompt(true)}
              className="pointer-events-auto btn-primary flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Enable AI Insights
            </button>
          )}
        </div>
      </header>

      {/* Main Canvas */}
      <GraphCanvas onNodeDoubleClick={handleNodeDoubleClick} />

      {/* UI Overlays */}
      <Toolbar />
      <SearchPanel />
      <NodeInfoPanel />
      <DevJournal />
      <Legend />

      {/* Gemini API Prompt */}
      {showApiPrompt && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-96 space-y-4">
            <h2 className="text-xl font-bold">Enable AI Insights</h2>
            <p className="text-sm text-slate-400">
              Enter your Google Gemini API key to enable AI-powered contextual
              enrichment and insights.
            </p>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Gemini API Key"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSetupGemini}
                className="flex-1 btn-primary"
                disabled={!geminiKey.trim()}
              >
                Enable
              </button>
              <button
                onClick={() => setShowApiPrompt(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Skip
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Get your API key at{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
