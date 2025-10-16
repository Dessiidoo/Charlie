import React from 'react';
import { InteractionMode } from '../types/charlie';

interface Props {
  currentMode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
}

export const ModeSelector: React.FC<Props> = ({ currentMode, onModeChange }) => {
  const modes: { id: InteractionMode; label: string; icon: string }[] = [
    { id: 'quick', label: 'Quick', icon: '⚡' },
    { id: 'strategy', label: 'Strategy', icon: '♟️' },
    { id: 'creative', label: 'Creative', icon: '✨' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
  ];

  return (
    <div className="flex gap-2">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            currentMode === mode.id
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <span className="mr-1">{mode.icon}</span>
          {mode.label}
        </button>
      ))}
    </div>
  );
};
