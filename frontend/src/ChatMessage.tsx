import React from 'react';
import { Message } from '../types/charlie';

interface Props {
  message: Message;
}

export const ChatMessage: React.FC<Props> = ({ message }) => {
  const isCharlie = message.role === 'charlie';
  
  return (
    <div className={`flex gap-3 mb-4 ${isCharlie ? 'justify-start' : 'justify-end'}`}>
      {isCharlie && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">C</span>
        </div>
      )}
      <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
        isCharlie 
          ? 'bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30' 
          : 'bg-gray-800 border border-gray-700'
      }`}>
        <p className={`text-sm ${isCharlie ? 'text-purple-100' : 'text-gray-100'}`}>
          {message.content}
        </p>
        <span className="text-xs text-gray-500 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
      {!isCharlie && (
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">L</span>
        </div>
      )}
    </div>
  );
};
