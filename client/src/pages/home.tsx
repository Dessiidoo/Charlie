import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bot, Settings, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import CodeEditor from "@/components/CodeEditor";
import FileUpload from "@/components/FileUpload";
import type { Conversation, Message } from "@shared/schema";

interface ChatMessage extends Omit<Message, 'createdAt'> {
  createdAt: Date;
}

export default function Home() {
  const [selectedModel, setSelectedModel] = useState('gpt-5');
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [editorCode, setEditorCode] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  const [editorFilename, setEditorFilename] = useState('code.js');
  const [consoleOutput, setConsoleOutput] = useState<string[]>(['✓ Charlie AI Assistant ready']);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations (mock user ID for now)
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    queryFn: () => 
      fetch('/api/conversations?userId=demo-user')
        .then(res => res.json()),
  });

  // Fetch messages for current conversation
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/conversations', currentConversationId, 'messages'],
    queryFn: () => 
      fetch(`/api/conversations/${currentConversationId}/messages`)
        .then(res => res.json()),
    enabled: !!currentConversationId,
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (data: { title: string; model: string }) => {
      const response = await apiRequest('POST', '/api/conversations', {
        ...data,
        userId: 'demo-user',
      });
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setCurrentConversationId(newConversation.id);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; role: string; conversationId?: string }) => {
      const conversationId = data.conversationId ?? currentConversationId;
      if (!conversationId) throw new Error('No conversation selected');

      const response = await apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
        content: data.content,
        role: data.role,
      });
      return response.json();
    },
    onSuccess: (_data, variables) => {
      const conversationId = variables.conversationId ?? currentConversationId;
      queryClient.invalidateQueries({
        queryKey: ['/api/conversations', conversationId, 'messages']
      });
    },
  });

  // Chat with AI mutation
  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; model: string; history: Array<{role: string; content: string}> }) => {
      const response = await apiRequest('POST', '/api/chat', data);
      return response.json();
    },
    onSuccess: async (aiResponse) => {
      // Add AI response to conversation
      if (currentConversationId) {
        await sendMessageMutation.mutateAsync({
          content: aiResponse.content,
          role: 'assistant',
        });
        
        // Update console with response time
        setConsoleOutput(prev => [
          ...prev,
          `✓ Response received in ${aiResponse.responseTime}ms`,
          `• Model: ${aiResponse.model}`,
          aiResponse.tokensUsed ? `• Tokens: ${aiResponse.tokensUsed}` : '',
        ].filter(Boolean));
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Chat failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      setConsoleOutput(prev => [...prev, `✗ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`]);
    },
  });

  const handleNewChat = async () => {
    const title = `New Chat ${new Date().toLocaleTimeString()}`;
    return await createConversationMutation.mutateAsync({ title, model: selectedModel });
  };

  const handleSendMessage = async (content: string) => {
    let conversationId = currentConversationId;
    if (!conversationId) {
      const maxAttempts = 3;
      for (let attempt = 0; attempt < maxAttempts && !conversationId; attempt++) {
        try {
          const newConversation = await handleNewChat();
          conversationId = newConversation?.id;
        } catch (error) {
          if (attempt === maxAttempts - 1) {
            toast({
              variant: "destructive",
              title: "Failed to start conversation",
              description: error instanceof Error ? error.message : 'Unknown error occurred',
            });
            return;
          }
        }
      }

      if (!conversationId) {
        toast({
          variant: "destructive",
          title: "Failed to start conversation",
          description: 'Could not create a new conversation',
        });
        return;
      }

      setCurrentConversationId(conversationId);
    }

    try {
      // Add user message
      await sendMessageMutation.mutateAsync({
        content,
        role: 'user',
        conversationId,
      });

      // Get AI response
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      chatMutation.mutate({
        message: content,
        model: selectedModel,
        history,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  const handleFilesAnalyzed = (files: any[], analysis: any[]) => {
    setShowFileUpload(false);
    
    if (files.length > 0) {
      const firstFile = files[0];
      setEditorCode(firstFile.content);
      setEditorLanguage(firstFile.language || 'javascript');
      setEditorFilename(firstFile.path);
      
      setConsoleOutput(prev => [
        ...prev,
        `✓ Analyzed ${files.length} file(s)`,
        `• Primary language: ${firstFile.language}`,
        `• Issues found: ${analysis.reduce((sum, a) => sum + a.issues.length, 0)}`,
      ]);
    }
  };

  const handleCodeGenerated = (code: string, language: string, filename: string) => {
    setEditorCode(code);
    setEditorLanguage(language);
    setEditorFilename(filename);
    setConsoleOutput(prev => [
      ...prev,
      `✓ Code loaded: ${filename}`,
      `• Language: ${language}`,
      `• Lines: ${code.split('\n').length}`,
    ]);
  };

  const chatMessages: ChatMessage[] = messages.map(m => ({
    ...m,
    createdAt: new Date(m.createdAt),
  }));

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="home-page">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="text-primary-foreground text-lg" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Charlie AI Assistant</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Online & Ready</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Model:</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-32" data-testid="select-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-5">GPT-5</SelectItem>
                <SelectItem value="claude-sonnet-4-20250514">Claude-4</SelectItem>
                <SelectItem value="auto">Auto-Select</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="secondary" data-testid="button-settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <Sidebar
          onNewChat={handleNewChat}
          onUploadFiles={() => setShowFileUpload(true)}
          conversations={conversations}
          onSelectConversation={setCurrentConversationId}
          currentConversationId={currentConversationId}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:flex-row">
          {showFileUpload ? (
            <div className="flex-1 p-6">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Upload Code Files</h2>
                <FileUpload
                  onFilesAnalyzed={handleFilesAnalyzed}
                  isLoading={chatMutation.isPending}
                />
                <div className="mt-6 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFileUpload(false)}
                    data-testid="button-back-to-chat"
                  >
                    Back to Chat
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Panel */}
              <div className="w-full lg:w-1/2">
                <ChatInterface
                  conversationId={currentConversationId}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  onCodeGenerated={handleCodeGenerated}
                  isLoading={sendMessageMutation.isPending || chatMutation.isPending}
                />
              </div>

              {/* Resize Handle */}
              <div className="w-1 bg-border hover:bg-primary transition-colors cursor-col-resize"></div>

              {/* Code Editor Panel */}
              <div className="w-full lg:w-1/2">
                <CodeEditor
                  code={editorCode}
                  language={editorLanguage}
                  filename={editorFilename}
                  onChange={setEditorCode}
                  consoleOutput={consoleOutput}
                  onRun={() => {
                    setConsoleOutput(prev => [
                      ...prev,
                      `✓ Code execution simulated`,
                      `• File: ${editorFilename}`,
                    ]);
                  }}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Status Bar */}
      <footer className="bg-card border-t border-border px-6 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>Charlie v1.0</span>
          <span>•</span>
          <span>{selectedModel} Active</span>
          <span>•</span>
          <span>{chatMessages.length} messages</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Response time: {chatMutation.data?.responseTime || 0}ms</span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Activity className="w-3 h-3 text-green-500" />
            <span>All systems operational</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
