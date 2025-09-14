import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, File, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFilesAnalyzed: (files: Array<{ path: string; content: string; language: string }>, analysis: any) => void;
  isLoading?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
}

export default function FileUpload({ onFilesAnalyzed, isLoading = false }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const supportedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs'];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    await processFiles(selectedFiles);
  }, []);

  const processFiles = async (fileList: File[]) => {
    const validFiles: UploadedFile[] = [];
    
    for (const file of fileList) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!supportedExtensions.includes(extension)) {
        toast({
          variant: "destructive",
          title: "Unsupported file type",
          description: `${file.name} is not a supported code file.`,
        });
        continue;
      }

      if (file.size > 1024 * 1024) { // 1MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds the 1MB size limit.`,
        });
        continue;
      }

      try {
        const content = await file.text();
        validFiles.push({
          id: Math.random().toString(36),
          name: file.name,
          size: file.size,
          type: file.type,
          content,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error reading file",
          description: `Failed to read ${file.name}.`,
        });
      }
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Files uploaded",
        description: `${validFiles.length} file(s) ready for analysis.`,
      });
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const analyzeFiles = async () => {
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      
      files.forEach(file => {
        const blob = new Blob([file.content], { type: 'text/plain' });
        formData.append('files', blob, file.name);
      });

      const response = await fetch('/api/upload-files', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      onFilesAnalyzed(result.files, result.analysis);
      
      toast({
        title: "Analysis complete",
        description: `${files.length} file(s) analyzed successfully.`,
      });
      
      setFiles([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "Failed to analyze the uploaded files.",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4" data-testid="file-upload">
      <Card
        className={`border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        data-testid="drop-zone"
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept={supportedExtensions.join(',')}
          className="hidden"
          onChange={handleFileInput}
          data-testid="input-file"
        />
        
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <div className="text-sm font-medium text-foreground">Drop files here to analyze</div>
        <div className="text-xs text-muted-foreground mt-1">
          Supports {supportedExtensions.join(', ')} and more
        </div>
        <Button variant="outline" className="mt-4" data-testid="button-browse-files">
          Browse Files
        </Button>
      </Card>

      {files.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Uploaded Files ({files.length})</h3>
            <Button 
              onClick={analyzeFiles}
              disabled={isLoading}
              data-testid="button-analyze-files"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Files'}
            </Button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-2 bg-secondary rounded-md"
                data-testid={`file-item-${file.id}`}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium truncate text-foreground">{file.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(file.size)}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  data-testid={`button-remove-file-${file.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
