import React from 'react';
import { Memory } from '../types/charlie';

interface Props {
  memories: Memory[];
}

export const MemoryPanel: React.FC<Props> = ({ memories }) => {
  const categoryIcons = {
    preference: '💜',
    decision: '🎯',
    insight: '💡'
  };

  return (
    <div className="bg-gray-900/50 border border-blue-500/20 rounded-xl p-6">
      <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
        <span>🧬</span> Memory Bank
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {memories.length > 0 ? (
          memories.map((memory) => (
            <div key={memory.id} className="bg-gray-800/50 rounded-lg p-3 border-l-4 border-blue-500/50">
              <div className="flex items-start gap-2">
                <span className="text-lg">{categoryIcons[memory.category]}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-200">{memory.content}</p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {new Date(memory.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No memories stored yet. Charlie learns as you interact.</p>
        )}
      </div>
    </div>
  );
};
