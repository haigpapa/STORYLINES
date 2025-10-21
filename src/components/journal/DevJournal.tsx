import { FileText, X, Info, Lightbulb, Code, Award } from 'lucide-react';
import { useGraphStore } from '../../store/useGraphStore';

const iconMap = {
  info: Info,
  decision: Lightbulb,
  technical: Code,
  milestone: Award,
};

const colorMap = {
  info: 'text-blue-400',
  decision: 'text-yellow-400',
  technical: 'text-purple-400',
  milestone: 'text-green-400',
};

export const DevJournal: React.FC = () => {
  const isJournalOpen = useGraphStore((state) => state.isJournalOpen);
  const toggleJournal = useGraphStore((state) => state.toggleJournal);
  const journalEntries = useGraphStore((state) => state.journalEntries);
  const clearJournal = useGraphStore((state) => state.clearJournal);

  if (!isJournalOpen) return null;

  return (
    <div className="absolute bottom-4 right-4 w-96 max-h-96 z-10">
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Development Journal
          </h2>
          <div className="flex gap-2">
            {journalEntries.length > 0 && (
              <button
                onClick={clearJournal}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={toggleJournal}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {journalEntries.length === 0 ? (
            <p className="text-sm text-slate-500 italic">
              No journal entries yet. Actions will be logged here as you explore.
            </p>
          ) : (
            journalEntries
              .slice()
              .reverse()
              .map((entry) => {
                const Icon = iconMap[entry.type];
                const colorClass = colorMap[entry.type];

                return (
                  <div
                    key={entry.id}
                    className="p-2 bg-slate-700/50 rounded-lg text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={`w-4 h-4 mt-0.5 ${colorClass}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200">{entry.message}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        <div className="border-t border-slate-700 pt-2">
          <p className="text-xs text-slate-500">
            This journal tracks your exploration workflow and technical decisions.
          </p>
        </div>
      </div>
    </div>
  );
};
