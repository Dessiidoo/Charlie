import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Download, Maximize2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  code: string;
  language: string;
  filename: string;
  onChange: (code: string) => void;
  onRun?: () => void;
  onDownload?: () => void;
  consoleOutput?: string[];
}

export default function CodeEditor({
  code,
  language,
  filename,
  onChange,
  onRun,
  onDownload,
  consoleOutput = [],
}: CodeEditorProps) {
  const [localCode, setLocalCode] = useState(code);
  const [copied, setCopied] = useState(false);
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  useEffect(() => {
    const lines = localCode.split('\n').length;
    setLineCount(lines);
  }, [localCode]);

  const handleCodeChange = (newCode: string) => {
    setLocalCode(newCode);
    onChange(newCode);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(localCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Code has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Failed to copy code to clipboard.",
      });
    }
  };

  const downloadCode = () => {
    const blob = new Blob([localCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: `${filename} is being downloaded.`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newCode = localCode.substring(0, start) + '  ' + localCode.substring(end);
      handleCodeChange(newCode);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const getLanguageBadgeColor = (lang: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-500/20 text-yellow-300',
      typescript: 'bg-blue-500/20 text-blue-300',
      python: 'bg-green-500/20 text-green-300',
      java: 'bg-red-500/20 text-red-300',
      cpp: 'bg-purple-500/20 text-purple-300',
      go: 'bg-cyan-500/20 text-cyan-300',
    };
    return colors[lang] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <div className="w-full flex flex-col bg-card" data-testid="code-editor">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Code Editor</h3>
          <div className="flex space-x-1">
            {onRun && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRun}
                data-testid="button-run-code"
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              data-testid="button-copy-code"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadCode}
              data-testid="button-download-code"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-expand-editor"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xs text-muted-foreground" data-testid="text-filename">
            {filename}
          </span>
          <Badge 
            className={`text-xs ${getLanguageBadgeColor(language)}`}
            data-testid="badge-language"
          >
            {language}
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 flex bg-background border border-border">
        {/* Line Numbers */}
        <div className="bg-muted/50 px-3 py-4 text-xs text-muted-foreground font-mono select-none border-r border-border">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>
        
        {/* Code Area */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={localCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent text-sm font-mono resize-none border-0 focus:ring-0 leading-6 p-4"
            style={{ fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace' }}
            placeholder="// Generated code will appear here\n// You can edit and run it directly"
            data-testid="textarea-code"
          />
        </div>
      </div>

      {/* Console Output */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Console Output</span>
          <Button variant="ghost" size="sm" data-testid="button-clear-console">
            <span className="text-xs">Clear</span>
          </Button>
        </div>
        <ScrollArea className="h-20">
          <div className="bg-secondary rounded-md p-3 text-xs font-mono space-y-1">
            {consoleOutput.length === 0 ? (
              <div className="text-muted-foreground">Ready for testing...</div>
            ) : (
              consoleOutput.map((line, index) => (
                <div 
                  key={index} 
                  className={`${
                    line.startsWith('✓') 
                      ? 'text-green-400' 
                      : line.startsWith('✗') || line.includes('error')
                      ? 'text-red-400'
                      : 'text-foreground'
                  }`}
                  data-testid={`console-line-${index}`}
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
