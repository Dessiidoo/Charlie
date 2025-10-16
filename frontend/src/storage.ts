import { Message, Context, Memory, Settings } from '../types/charlie';

const STORAGE_KEYS = {
  MESSAGES: 'charlie_messages',
  CONTEXT: 'charlie_context',
  MEMORIES: 'charlie_memories',
  SETTINGS: 'charlie_settings',
};

export const storage = {
  getMessages: (): Message[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  },
  
  saveMessages: (messages: Message[]) => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  },
  
  getContext: (): Context => {
    const data = localStorage.getItem(STORAGE_KEYS.CONTEXT);
    return data ? JSON.parse(data) : {
      projects: [],
      preferences: {},
      milestones: []
    };
  },
  
  saveContext: (context: Context) => {
    localStorage.setItem(STORAGE_KEYS.CONTEXT, JSON.stringify(context));
  },
  
  getMemories: (): Memory[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    return data ? JSON.parse(data) : [];
  },
  
  saveMemories: (memories: Memory[]) => {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  },
  
  getSettings: (): Settings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      responseStyle: 'detailed',
      priorityFocus: ['Jeosync', 'Echo AI', 'Flex'],
      notifications: true
    };
  },
  
  saveSettings: (settings: Settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
  
  exportAll: () => {
    return {
      messages: storage.getMessages(),
      context: storage.getContext(),
      memories: storage.getMemories(),
      settings: storage.getSettings(),
      exportDate: Date.now()
    };
  },
  
  importAll: (data: any) => {
    if (data.messages) storage.saveMessages(data.messages);
    if (data.context) storage.saveContext(data.context);
    if (data.memories) storage.saveMemories(data.memories);
    if (data.settings) storage.saveSettings(data.settings);
  }
};
