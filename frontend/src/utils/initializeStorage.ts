import { storage } from './storage';
import { initialContext, initialMemories } from '../data/initialData';

export const initializeStorage = () => {
  // Only initialize if no data exists
  const existingMessages = storage.getMessages();
  const existingContext = storage.getContext();
  const existingMemories = storage.getMemories();
  
  if (existingContext.projects.length === 0) {
    storage.saveContext(initialContext);
  }
  
  if (existingMemories.length === 0) {
    storage.saveMemories(initialMemories);
  }
  
  // Add welcome message if no messages exist
  if (existingMessages.length === 0) {
    const welcomeMessage = {
      id: Date.now().toString(),
      role: 'charlie' as const,
      content: "Hello, Loretta. I'm Charlie — your AI assistant and creative collaborator. I'm here to help you with Jeosync, Echo AI, Flex, and whatever else you're building. I've been trained with your context and I'm ready to think alongside you. What's on your mind today?",
      timestamp: Date.now()
    };
    storage.saveMessages([welcomeMessage]);
  }
};
