import React from 'react';
import { Settings } from '../types/charlie';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-purple-300 mb-6">Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Response Style
            </label>
            <select
              value={localSettings.responseStyle}
              onChange={(e) => setLocalSettings({...localSettings, responseStyle: e.target.value as any})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="concise">Concise</option>
              <option value="detailed">Detailed</option>
              <option value="poetic">Poetic</option>
            </select>
          </div>
          
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localSettings.notifications}
                onChange={(e) => setLocalSettings({...localSettings, notifications: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Enable Notifications</span>
            </label>
          </div>
        </div>
        
        <div className="flex gap-3 mt-8">
          <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-medium">
            Save
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-800 text-gray-300 py-2 rounded-lg font-medium">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
