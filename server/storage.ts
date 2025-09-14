import { 
  type User, 
  type InsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type CodeProject,
  type InsertCodeProject,
  type CodeAnalysis,
  type InsertCodeAnalysis
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;

  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Code Projects
  getCodeProject(id: string): Promise<CodeProject | undefined>;
  getCodeProjectsByConversationId(conversationId: string): Promise<CodeProject[]>;
  createCodeProject(project: InsertCodeProject): Promise<CodeProject>;
  updateCodeProject(id: string, updates: Partial<CodeProject>): Promise<CodeProject | undefined>;

  // Code Analysis
  getCodeAnalysis(id: string): Promise<CodeAnalysis | undefined>;
  getCodeAnalysesByProjectId(projectId: string): Promise<CodeAnalysis[]>;
  createCodeAnalysis(analysis: InsertCodeAnalysis): Promise<CodeAnalysis>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();
  private codeProjects: Map<string, CodeProject> = new Map();
  private codeAnalyses: Map<string, CodeAnalysis> = new Map();

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      userId: insertConversation.userId || null,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updated = { ...conversation, ...updates, updatedAt: new Date() };
    this.conversations.set(id, updated);
    return updated;
  }

  // Messages
  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      metadata: insertMessage.metadata || null,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  // Code Projects
  async getCodeProject(id: string): Promise<CodeProject | undefined> {
    return this.codeProjects.get(id);
  }

  async getCodeProjectsByConversationId(conversationId: string): Promise<CodeProject[]> {
    return Array.from(this.codeProjects.values())
      .filter(project => project.conversationId === conversationId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async createCodeProject(insertProject: InsertCodeProject): Promise<CodeProject> {
    const id = randomUUID();
    const now = new Date();
    const project: CodeProject = {
      ...insertProject,
      id,
      conversationId: insertProject.conversationId || null,
      analysis: insertProject.analysis || null,
      createdAt: now,
      updatedAt: now,
    };
    this.codeProjects.set(id, project);
    return project;
  }

  async updateCodeProject(id: string, updates: Partial<CodeProject>): Promise<CodeProject | undefined> {
    const project = this.codeProjects.get(id);
    if (!project) return undefined;
    
    const updated = { ...project, ...updates, updatedAt: new Date() };
    this.codeProjects.set(id, updated);
    return updated;
  }

  // Code Analysis
  async getCodeAnalysis(id: string): Promise<CodeAnalysis | undefined> {
    return this.codeAnalyses.get(id);
  }

  async getCodeAnalysesByProjectId(projectId: string): Promise<CodeAnalysis[]> {
    return Array.from(this.codeAnalyses.values())
      .filter(analysis => analysis.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createCodeAnalysis(insertAnalysis: InsertCodeAnalysis): Promise<CodeAnalysis> {
    const id = randomUUID();
    const analysis: CodeAnalysis = {
      ...insertAnalysis,
      id,
      suggestions: insertAnalysis.suggestions || null,
      createdAt: new Date(),
    };
    this.codeAnalyses.set(id, analysis);
    return analysis;
  }
}

export const storage = new MemStorage();
