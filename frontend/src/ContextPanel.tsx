import React from 'react';
import { Context } from '../types/charlie';

interface Props {
  context: Context;
}

export const ContextPanel: React.FC<Props> = ({ context }) => {
  return (
    <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-6">
      <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
        <span>🧠</span> Active Context
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Projects</h4>
          {context.projects.length > 0 ? (
            context.projects.map((project, idx) => (
              <div key={idx} className="bg-gray-800/50 rounded-lg p-3 mb-2">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-purple-200">{project.name}</span>
                  <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                    {project.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{project.description}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No projects tracked yet</p>
          )}
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Recent Milestones</h4>
          {context.milestones.slice(0, 3).map((milestone) => (
            <div key={milestone.id} className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-300">{milestone.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
