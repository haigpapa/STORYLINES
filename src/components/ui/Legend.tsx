import React from 'react';
import { NodeType } from '../../types';

const nodeTypes: { type: NodeType; color: string; description: string }[] = [
  { type: 'author', color: '#8b5cf6', description: 'Writers and creators' },
  { type: 'book', color: '#3b82f6', description: 'Literary works' },
  { type: 'genre', color: '#10b981', description: 'Categories and styles' },
  { type: 'theme', color: '#f59e0b', description: 'Concepts and motifs' },
  { type: 'character', color: '#ef4444', description: 'Notable characters' },
  { type: 'movement', color: '#ec4899', description: 'Literary movements' },
];

export const Legend: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 z-10">
      <div className="card p-3 space-y-2">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Node Types</h3>
        <div className="space-y-1.5">
          {nodeTypes.map(({ type, color, description }) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div>
                <span className="text-sm font-medium text-white capitalize">
                  {type}
                </span>
                <p className="text-xs text-slate-400">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-700 pt-2 mt-2">
          <p className="text-xs text-slate-500">
            Click nodes to view details • Double-click to expand • Drag to rearrange
          </p>
        </div>
      </div>
    </div>
  );
};
