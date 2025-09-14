import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Code, Bug, Rocket, TrendingUp } from "lucide-react";

interface SidebarProps {
  onNewChat: () => void;
  onUploadFiles: () => void;
  conversations: Array<{
    id: string;
    title: string;
    updatedAt: Date;
  }>;
  onSelectConversation: (id: string) => void;
  currentConversationId?: string;
}

export default function Sidebar({
  onNewChat,
  onUploadFiles,
  conversations,
  onSelectConversation,
  currentConversationId,
}: SidebarProps) {
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold mb-3 text-foreground">Quick Actions</h2>
        <div className="space-y-2">
          <Button 
            onClick={onNewChat}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid="button-new-chat"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
          <Button 
            onClick={onUploadFiles}
            variant="secondary"
            className="w-full"
            data-testid="button-upload-code"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Code
          </Button>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <h3 className="font-medium mb-3 text-sm text-foreground">Capabilities</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Code className="w-4 h-4" />
            <span>Code Analysis</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Bug className="w-4 h-4" />
            <span>Bug Detection</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Rocket className="w-4 h-4" />
            <span>App Generation</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>Performance Optimization</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="font-medium mb-3 text-sm text-foreground">Recent Sessions</h3>
        {conversations.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-secondary ${
                  currentConversationId === conversation.id ? 'bg-secondary border-primary' : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
                data-testid={`conversation-${conversation.id}`}
              >
                <div className="text-sm font-medium text-foreground truncate">
                  {conversation.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatRelativeTime(conversation.updatedAt)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" data-testid="status-indicator"></div>
          <span className="text-muted-foreground">Online & Ready</span>
        </div>
      </div>
    </aside>
  );
}
