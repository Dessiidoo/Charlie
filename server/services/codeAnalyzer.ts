export interface CodeFile {
  path: string;
  content: string;
  language: string;
}

export interface AnalysisResult {
  file: string;
  language: string;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    line?: number;
    column?: number;
    message: string;
    rule?: string;
  }>;
  metrics: {
    linesOfCode: number;
    complexity: number;
    maintainabilityIndex: number;
  };
  suggestions: Array<{
    category: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

export class CodeAnalyzer {
  async analyzeFiles(files: CodeFile[]): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    for (const file of files) {
      const result = await this.analyzeFile(file);
      results.push(result);
    }
    
    return results;
  }

  private async analyzeFile(file: CodeFile): Promise<AnalysisResult> {
    const language = this.detectLanguage(file.path, file.content);
    const lines = file.content.split('\n');
    
    return {
      file: file.path,
      language,
      issues: this.findIssues(file.content, language),
      metrics: this.calculateMetrics(file.content, language),
      suggestions: this.generateSuggestions(file.content, language),
    };
  }

  private detectLanguage(path: string, content: string): string {
    const extension = path.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
    };

    if (extension && languageMap[extension]) {
      return languageMap[extension];
    }

    // Content-based detection fallback
    if (content.includes('import React') || content.includes('from react')) {
      return 'javascript';
    }
    if (content.includes('def ') || content.includes('import ')) {
      return 'python';
    }
    if (content.includes('public class') || content.includes('private ')) {
      return 'java';
    }
    
    return 'unknown';
  }

  private findIssues(content: string, language: string): Array<{
    type: 'error' | 'warning' | 'info';
    line?: number;
    column?: number;
    message: string;
    rule?: string;
  }> {
    const issues = [];
    const lines = content.split('\n');
    
    // Basic static analysis rules
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Common issues across languages
      if (line.includes('console.log') && language === 'javascript') {
        issues.push({
          type: 'warning' as const,
          line: lineNumber,
          message: 'Remove console.log statements before production',
          rule: 'no-console',
        });
      }
      
      if (line.includes('TODO') || line.includes('FIXME')) {
        issues.push({
          type: 'info' as const,
          line: lineNumber,
          message: 'TODO comment found',
          rule: 'todo-comment',
        });
      }
      
      // Long lines
      if (line.length > 120) {
        issues.push({
          type: 'warning' as const,
          line: lineNumber,
          message: 'Line too long (>120 characters)',
          rule: 'max-line-length',
        });
      }
      
      // Language-specific rules
      if (language === 'javascript' || language === 'typescript') {
        if (line.includes('var ')) {
          issues.push({
            type: 'warning' as const,
            line: lineNumber,
            message: 'Use let or const instead of var',
            rule: 'no-var',
          });
        }
        
        if (line.includes('== ') || line.includes('!= ')) {
          issues.push({
            type: 'warning' as const,
            line: lineNumber,
            message: 'Use strict equality (=== or !==)',
            rule: 'strict-equality',
          });
        }
      }
      
      if (language === 'python') {
        if (line.match(/^\s*print\(/)) {
          issues.push({
            type: 'info' as const,
            line: lineNumber,
            message: 'Consider using logging instead of print statements',
            rule: 'prefer-logging',
          });
        }
      }
    }
    
    return issues;
  }

  private calculateMetrics(content: string, language: string): {
    linesOfCode: number;
    complexity: number;
    maintainabilityIndex: number;
  } {
    const lines = content.split('\n');
    const linesOfCode = lines.filter(line => 
      line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('#')
    ).length;
    
    // Simple complexity calculation based on control structures
    const complexityKeywords = ['if', 'for', 'while', 'switch', 'case', 'catch', 'else'];
    let complexity = 1; // Base complexity
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const keyword of complexityKeywords) {
        if (lowerLine.includes(keyword)) {
          complexity++;
        }
      }
    }
    
    // Maintainability index (simplified calculation)
    const maintainabilityIndex = Math.max(0, Math.min(100, 
      100 - (complexity * 2) - (linesOfCode / 10)
    ));
    
    return {
      linesOfCode,
      complexity,
      maintainabilityIndex: Math.round(maintainabilityIndex),
    };
  }

  private generateSuggestions(content: string, language: string): Array<{
    category: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }> {
    const suggestions = [];
    const lines = content.split('\n');
    
    // Check for missing error handling
    const hasErrorHandling = content.includes('try') || content.includes('catch') || 
                            content.includes('except') || content.includes('finally');
    
    if (!hasErrorHandling && lines.length > 20) {
      suggestions.push({
        category: 'Error Handling',
        description: 'Consider adding error handling with try-catch blocks',
        impact: 'high' as const,
      });
    }
    
    // Check for code documentation
    const hasComments = lines.some(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') || 
      line.trim().startsWith('/*') ||
      line.trim().startsWith('"""')
    );
    
    if (!hasComments && lines.length > 10) {
      suggestions.push({
        category: 'Documentation',
        description: 'Add comments to explain complex logic',
        impact: 'medium' as const,
      });
    }
    
    // Check for hardcoded values
    const hasHardcodedValues = lines.some(line => 
      /\d{3,}/.test(line) || // Large numbers
      /"[^"]*\w+[^"]*"/.test(line) // Strings with content
    );
    
    if (hasHardcodedValues) {
      suggestions.push({
        category: 'Configuration',
        description: 'Consider moving hardcoded values to configuration files',
        impact: 'medium' as const,
      });
    }
    
    return suggestions;
  }
}

export const codeAnalyzer = new CodeAnalyzer();
