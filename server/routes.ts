import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { aiService } from "./services/aiService";
import { codeAnalyzer } from "./services/codeAnalyzer";
import { insertConversationSchema, insertMessageSchema, insertCodeProjectSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat') {
          // Handle real-time chat message
          const response = await aiService.chat(
            message.content, 
            message.model,
            message.history
          );
          
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'chat_response',
              ...response,
            }));
          }
        }
      } catch (error) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
          }));
        }
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Conversations
  app.get('/api/conversations', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
      }
      
      const conversations = await storage.getConversationsByUserId(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  });

  app.post('/api/conversations', async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  });

  app.get('/api/conversations/:id', async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  });

  // Messages
  app.get('/api/conversations/:id/messages', async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversationId(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  });

  app.post('/api/conversations/:id/messages', async (req, res) => {
    try {
      const messageData = {
        ...req.body,
        conversationId: req.params.id,
      };
      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  });

  // AI Chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, model = 'auto', history = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }
      
      const response = await aiService.chat(message, model, history);
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  });

  // Code Analysis
  app.post('/api/analyze-code', async (req, res) => {
    try {
      const { code, language, analysisType } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ message: 'Code and language are required' });
      }
      
      const analysis = await aiService.analyzeCode({ code, language, analysisType });
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  });

  // App Generation
  app.post('/api/generate-app', async (req, res) => {
    try {
      const { description, framework, features } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: 'Description is required' });
      }
      
      const appGeneration = await aiService.generateApp({ description, framework, features });
      res.json(appGeneration);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  });

  // File Upload and Analysis
  app.post('/api/upload-files', upload.array('files', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      
      const codeFiles = files.map(file => ({
        path: file.originalname,
        content: file.buffer.toString('utf-8'),
        language: '', // Will be detected by analyzer
      }));
      
      const analysis = await codeAnalyzer.analyzeFiles(codeFiles);
      res.json({ files: codeFiles, analysis });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  });

  // Code Projects
  app.get('/api/conversations/:id/projects', async (req, res) => {
    try {
      const projects = await storage.getCodeProjectsByConversationId(req.params.id);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  });

  app.post('/api/conversations/:id/projects', async (req, res) => {
    try {
      const projectData = {
        ...req.body,
        conversationId: req.params.id,
      };
      const validatedData = insertCodeProjectSchema.parse(projectData);
      const project = await storage.createCodeProject(validatedData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  });

  app.put('/api/projects/:id', async (req, res) => {
    try {
      const { code, analysis } = req.body;
      const updates = { code, analysis };
      const project = await storage.updateCodeProject(req.params.id, updates);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  });

  return httpServer;
}
