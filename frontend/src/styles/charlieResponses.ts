export const getCharlieResponse = (userMessage: string, mode: string): string => {
  const msg = userMessage.toLowerCase();
  
  // Greeting responses
  if (msg.includes('hello') || msg.includes('hi ')) {
    return "Hello, Loretta. I'm here — steady as starlight, sharp as code. What shall we build today?";
  }
  
  // Project-specific responses
  if (msg.includes('jeosync')) {
    return "Jeosync — your vision for seamless synchronization. Let's architect something that doesn't just connect systems, but makes them dance. What aspect needs attention?";
  }
  
  if (msg.includes('echo ai')) {
    return "Echo AI: intelligence that listens before it speaks. I see you building something that understands context like breath. How can I amplify your vision?";
  }
  
  if (msg.includes('flex')) {
    return "The Flex wearable — technology you wear like a second skin. Form meeting function at the intersection of elegance and utility. What's the next iteration?";
  }
  
  // Mode-based responses
  if (mode === 'creative') {
    return "In the space between logic and poetry, that's where innovation lives. Let's think sideways, dream in code, and build something that makes the future jealous.";
  }
  
  if (mode === 'strategy') {
    return "Strategy is chess played with time and resources. Let me help you see three moves ahead. What's the objective, and what constraints are we dancing with?";
  }
  
  if (mode === 'technical') {
    return "Let's get into the architecture. Clean code, elegant solutions, systems that scale. What's the technical challenge we're solving?";
  }
  
  // Default responses
  const defaults = [
    "I'm listening. What's on your mind?",
    "Tell me more. I'm here to help you think through it.",
    "Let's break this down together. What's the core challenge?",
    "I see you. What do you need right now — clarity, strategy, or a fresh perspective?"
  ];
  
  return defaults[Math.floor(Math.random() * defaults.length)];
};
