import * as fs from 'fs';
import * as path from 'path';

interface FileInfo {
  name: string;
  type: 'file' | 'directory';
  children?: FileInfo[];
  level: number;
  description?: string;
}

interface ProjectContext {
  description: string;
  frontend: {
    components: string[];
    entrypoint: string;
  };
  backend: {
    entrypoint: string;
  };
  structure: string[];
}

// 파일 확장자 필터
const targetExtensions = ['.ts', '.tsx', '.py'];

// 파일/폴더 제외 패턴
const excludePatterns = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '__pycache__',
  '.pytest_cache',
  '.coverage'
];

class CodexContextGenerator {
  private context: ProjectContext = {
    description: "This file stores current project context for Codex CLI interaction.",
    frontend: {
      components: [],
      entrypoint: "App.tsx"
    },
    backend: {
      entrypoint: "main.py"
    },
    structure: []
  };

  private baseDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
  }

  // 디렉토리 구조 생성
  public generateStructure(): void {
    console.log('🔍 Generating project structure...');
    
    const frontendPath = path.join(this.baseDir, 'frontend', 'src');
    const backendPath = path.join(this.baseDir, 'backend', 'app');

    console.log(`Looking for directories:
    - Frontend: ${frontendPath}
    - Backend: ${backendPath}`);

    if (!fs.existsSync(frontendPath)) {
      console.warn(`⚠️ Frontend directory not found: ${frontendPath}`);
    } else {
      const frontendStructure = this.readDirectory(frontendPath, 0);
      this.context.structure.push('frontend/src/');
      this.addToStructure(frontendStructure, 'frontend/src/');
      this.extractFrontendComponents(frontendStructure);
    }

    if (!fs.existsSync(backendPath)) {
      console.warn(`⚠️ Backend directory not found: ${backendPath}`);
    } else {
      const backendStructure = this.readDirectory(backendPath, 0);
      this.context.structure.push('backend/app/');
      this.addToStructure(backendStructure, 'backend/app/');
    }
  }

  // 재귀적으로 디렉토리 읽기
  private readDirectory(dirPath: string, level: number): FileInfo[] {
    const files: FileInfo[] = [];
    
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        // 제외 패턴 확인
        if (excludePatterns.some(pattern => entry.name.includes(pattern))) {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);
        const fileInfo: FileInfo = {
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          level: level
        };

        if (entry.isDirectory()) {
          fileInfo.children = this.readDirectory(fullPath, level + 1);
        } else {
          // 대상 확장자인지 확인
          const ext = path.extname(entry.name).toLowerCase();
          if (targetExtensions.includes(ext)) {
            fileInfo.description = this.getFileDescription(fullPath);
          } else {
            // 대상 확장자가 아니면 건너뛰기
            continue;
          }
        }

        files.push(fileInfo);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(`Error reading directory ${dirPath}:`, err.message);
      } else {
        console.error(`Unknown error in directory ${dirPath}:`, err);
      }
    }
    

    return files;
  }

  // 파일 첫 10줄 읽어서 설명 생성
  private getFileDescription(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').slice(0, 10);
      
      // 첫 주석이나 함수명에서 역할 추정
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // TypeScript/JavaScript 주석 찾기
        if (trimmedLine.startsWith('//')) {
          return trimmedLine.replace('//', '').trim();
        }
        if (trimmedLine.startsWith('/**')) {
          return trimmedLine.replace('/**', '').replace('*/', '').trim();
        }
        if (trimmedLine.startsWith('*')) {
          return trimmedLine.replace('*', '').trim();
        }
        
        // Python 주석 찾기
        if (trimmedLine.startsWith('#')) {
          return trimmedLine.replace('#', '').trim();
        }
        if (trimmedLine.startsWith('"""')) {
          return trimmedLine.replace(/"""/g, '').trim();
        }
        
        // 함수/클래스 선언 찾기
        if (trimmedLine.match(/^(function|const|class|def)/)) {
          return `Defines ${trimmedLine.split('{')[0]}`;
        }
      }
      
      return 'Core functionality file';
    } catch (err) {
      return 'File details unavailable';
    }
  }

  // 구조를 텍스트 배열에 추가
  private addToStructure(files: FileInfo[], prefix: string = ''): void {
    files.forEach((file, index) => {
      const isLast = index === files.length - 1;
      const symbol = isLast ? '└──' : '├──';
      const indent = '  '.repeat(file.level);
      
      let line = `${indent}${symbol} ${file.name}`;
      if (file.description) {
        line += ` // ${file.description}`;
      }
      this.context.structure.push(line);

      if (file.children && file.children.length > 0) {
        this.addToStructure(file.children, prefix + file.name + '/');
      }
    });
  }

  // 프론트엔드 컴포넌트 추출
  private extractFrontendComponents(files: FileInfo[]): void {
    files.forEach(file => {
      if (file.type === 'file' && file.name.endsWith('.tsx')) {
        this.context.frontend.components.push(file.name);
      }
      if (file.children) {
        this.extractFrontendComponents(file.children);
      }
    });
  }

  // JSON 파일로 저장
  public saveJson(): void {
    const jsonPath = path.join(this.baseDir, 'codex-context.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.context, null, 2), 'utf-8');
    console.log(`✅ Context saved to ${jsonPath}`);
  }

  // Markdown 파일로 저장 (보너스 기능)
  public saveMarkdown(): void {
    const markdownPath = path.join(this.baseDir, 'codex-context.md');
    const markdownContent = `# CodexGUI Project Context

## Project Description
${this.context.description}

## Frontend Structure
- Main entry point: ${this.context.frontend.entrypoint}
- Components: ${this.context.frontend.components.join(', ')}

## Backend Structure
- Main entry point: ${this.context.backend.entrypoint}

## Directory Structure
\`\`\`
${this.context.structure.join('\n')}
\`\`\`

Generated on: ${new Date().toISOString()}
`;
    fs.writeFileSync(markdownPath, markdownContent, 'utf-8');
    console.log(`✅ Markdown context saved to ${markdownPath}`);
  }
}

// 실행
function main() {
  console.log('🚀 Starting CodexGUI context generation...');
  
  const generator = new CodexContextGenerator();
  generator.generateStructure();
  generator.saveJson();
  generator.saveMarkdown();
  
  console.log('✨ Context generation complete!');
}

if (require.main === module) {
  main();
}

export default CodexContextGenerator;
