import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Paperclip, Mic, Send, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { Message } from "@shared/schema";

interface ChatMessage extends Omit<Message, 'createdAt'> {
  createdAt: Date;
  isStreaming?: boolean;
}

interface ChatInterfaceProps {
  conversationId?: string;
  selectedModel: string;
  onModelChange: (model: string) => void;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onCodeGenerated?: (code: string, language: string, filename: string) => void;
  isLoading?: boolean;
}

export default function ChatInterface({
  conversationId,
  selectedModel,
  onModelChange,
  messages,
  onSendMessage,
  onCodeGenerated,
  isLoading = false,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const { sendMessage, isConnected } = useWebSocket({
    onMessage: (wsMessage) => {
      if (wsMessage.type === 'chat_response') {
        // Handle real-time response
        console.log('Real-time response:', wsMessage);
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    setInput('');
    
    // Send message through callback
    onSendMessage(messageContent);

    // Also send through WebSocket for real-time updates
    if (isConnected) {
      sendMessage({
        type: 'chat',
        content: messageContent,
        model: selectedModel,
        conversationId,
        history: messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content,
        })),
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Message content copied successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Failed to copy content to clipboard.",
      });
    }
  };

  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
      });
    }

    return blocks;
  };

  const handleUseCode = (code: string, language: string) => {
    const filename = `generated.${language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language}`;
    onCodeGenerated?.(code, language, filename);
    toast({
      title: "Code loaded",
      description: "Code has been loaded into the editor.",
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    const codeBlocks = extractCodeBlocks(message.content);
    const contentWithoutCode = message.content.replace(/```(\w+)?\n([\s\S]*?)```/g, '').trim();

    return (
      <div
        key={message.id}
        className={`flex items-start space-x-3 ${isUser ? 'justify-end' : ''}`}
        data-testid={`message-${message.id}`}
      >
        {!isUser && (
          <Avatar className="w-8 h-8 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-3xl ${isUser ? 'order-first' : ''}`}>
          <Card 
            className={`p-4 ${
              isUser 
                ? 'bg-primary text-primary-foreground ml-12' 
                : 'bg-card border border-border'
            }`}
          >
            {!isUser && (
              <div className="text-sm font-medium mb-2 text-foreground">
                Charlie AI Assistant
                <Badge variant="outline" className="ml-2 text-xs">
                  {selectedModel}
                </Badge>
              </div>
            )}
            
            {contentWithoutCode && (
              <div className="text-sm whitespace-pre-wrap text-foreground">
                {contentWithoutCode}
              </div>
            )}
            
            {codeBlocks.map((block, index) => (
              <div key={index} className="mt-4">
                <div className="bg-background rounded-lg overflow-hidden border border-border">
                  <div className="bg-muted px-4 py-2 text-xs font-medium flex items-center justify-between">
                    <span className="text-muted-foreground">{block.language}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(block.code, `${message.id}-${index}`)}
                        data-testid={`button-copy-code-${message.id}-${index}`}
                      >
                        {copiedMessageId === `${message.id}-${index}` ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                      {onCodeGenerated && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUseCode(block.code, block.language)}
                          data-testid={`button-use-code-${message.id}-${index}`}
                        >
                          Use Code
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="max-h-96">
                    <pre className="p-4 text-xs font-mono overflow-x-auto">
                      <code>{block.code}</code>
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            ))}
            
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>{message.createdAt.toLocaleTimeString()}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(message.content, message.id)}
                data-testid={`button-copy-message-${message.id}`}
              >
                {copiedMessageId === message.id ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </Card>
        </div>
        
        {isUser && (
          <Avatar className="w-8 h-8 bg-secondary">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col" data-testid="chat-interface">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-card border border-border p-4 max-w-3xl">
                <div className="text-sm font-medium mb-2 text-foreground">Charlie AI Assistant</div>
                <div className="text-sm text-foreground">
                  👋 Hello! I'm Charlie, your AI development assistant. I can help you:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Build applications from natural language descriptions</li>
                    <li>Analyze and fix code in any programming language</li>
                    <li>Optimize performance and suggest best practices</li>
                    <li>Scale and refactor existing codebases</li>
                  </ul>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Try uploading a file or describe what you'd like to build!
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            messages.map(renderMessage)
          )}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-card border border-border p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-sm text-muted-foreground ml-2">Charlie is thinking...</span>
                </div>
              </Card>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring pr-20"
              rows={3}
              placeholder="Describe what you want to build, ask for code analysis, or request optimizations..."
              disabled={isLoading}
              data-testid="textarea-chat-input"
            />
            <div className="absolute bottom-2 right-2 flex space-x-1">
              <Button variant="ghost" size="sm" data-testid="button-attach-file">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-voice-input">
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
