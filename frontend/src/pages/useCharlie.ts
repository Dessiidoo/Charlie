import { useState, useEffect } from 'react';
import { Message, Context, Memory, Settings, InteractionMode } from '../types/charlie';
import { storage } from '../utils/storage';
import { getCharlieResponse } from '../data/charlieResponses';
import { initializeStorage } from '../utils/initializeStorage';


export const useCharlie = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [context, setContext] = useState<Context>({ projects: [], preferences: {}, milestones: [] });
  const [memories, setMemories] = useState<Memory[]>([]);
  const [settings, setSettings] = useState<Settings>({ responseStyle: 'detailed', priorityFocus: [], notifications: true });
  const [mode, setMode] = useState<InteractionMode>('quick');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    initializeStorage();
    setMessages(storage.getMessages());
    setContext(storage.getContext());
    setMemories(storage.getMemories());
    setSettings(storage.getSettings());
  }, []);


  const sendMessage = (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
      mode
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    storage.saveMessages(newMessages);
    
    setIsTyping(true);
    setTimeout(() => {
      const response = getCharlieResponse(content, mode);
      const charlieMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'charlie',
        content: response,
        timestamp: Date.now(),
        mode
      };
      
      const updatedMessages = [...newMessages, charlieMsg];
      setMessages(updatedMessages);
      storage.saveMessages(updatedMessages);
      setIsTyping(false);
    }, 1000);
  };

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const exportData = () => {
    const data = storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `charlie-export-${Date.now()}.json`;
    a.click();
  };

  return { messages, context, memories, settings, mode, isTyping, sendMessage, setMode, updateSettings, exportData };
};
