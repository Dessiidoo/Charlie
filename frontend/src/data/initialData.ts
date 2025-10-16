import { Context, Memory } from '../types/charlie';

export const initialContext: Context = {
  projects: [
    {
      name: 'Jeosync',
      description: 'Seamless synchronization platform connecting systems and data streams',
      status: 'Active',
      lastUpdated: Date.now()
    },
    {
      name: 'Echo AI',
      description: 'Context-aware AI assistant that listens and understands deeply',
      status: 'Development',
      lastUpdated: Date.now()
    },
    {
      name: 'Flex Wearable',
      description: 'Next-generation wearable technology blending form and function',
      status: 'Prototype',
      lastUpdated: Date.now()
    }
  ],
  preferences: {
    workStyle: 'Deep focus with creative bursts',
    communicationStyle: 'Direct and poetic',
    priorityAreas: ['Innovation', 'User Experience', 'Technical Excellence']
  },
  milestones: [
    {
      id: '1',
      title: 'Jeosync MVP Launch',
      date: Date.now() - 86400000 * 30,
      category: 'Product'
    },
    {
      id: '2',
      title: 'Echo AI Architecture Finalized',
      date: Date.now() - 86400000 * 15,
      category: 'Technical'
    },
    {
      id: '3',
      title: 'Flex Prototype Testing Complete',
      date: Date.now() - 86400000 * 7,
      category: 'Hardware'
    }
  ]
};

export const initialMemories: Memory[] = [
  {
    id: '1',
    content: 'Loretta prefers direct communication without sugarcoating',
    category: 'preference',
    timestamp: Date.now() - 86400000 * 60
  },
  {
    id: '2',
    content: 'Decision: Focus on user experience over feature bloat for Echo AI',
    category: 'decision',
    timestamp: Date.now() - 86400000 * 45
  },
  {
    id: '3',
    content: 'Insight: Combining poetic thinking with technical precision yields breakthrough solutions',
    category: 'insight',
    timestamp: Date.now() - 86400000 * 30
  }
];
