export interface Message {
  id: string;
  role: 'user' | 'charlie';
  content: string;
  timestamp: number;
  mode?: string;
}

export interface Context {
  projects: Project[];
  preferences: Record<string, any>;
  milestones: Milestone[];
}

export interface Project {
  name: string;
  description: string;
  status: string;
  lastUpdated: number;
}

export interface Milestone {
  id: string;
  title: string;
  date: number;
  category: string;
}

export interface Memory {
  id: string;
  content: string;
  category: 'preference' | 'decision' | 'insight';
  timestamp: number;
}

export type InteractionMode = 'quick' | 'strategy' | 'creative' | 'technical';

export interface Settings {
  responseStyle: 'concise' | 'detailed' | 'poetic';
  priorityFocus: string[];
  notifications: boolean;
}
