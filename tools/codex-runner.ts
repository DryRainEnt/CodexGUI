#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface Step {
  description: string;
  prompt: string;
  target: string;
}

interface CodexScenario {
  steps: Step[];
}

interface CodexContext {
  projectName: string;
  description: string;
  structure: any;
  files: any;
}

class CodexRunner {
  private scenarioFile: string;
  private contextFile: string;
  private logFile: string;

  constructor() {
    this.scenarioFile = path.join(process.cwd(), '.codex-scenario.json');
    this.contextFile = path.join(process.cwd(), 'codex-context.json');
    this.logFile = path.join(process.cwd(), 'codex-runner-error.log');
  }

  private log(message: string): void {
    console.log(message);
  }

  private logError(error: any): void {
    const errorMessage = `[${new Date().toISOString()}] ${error}\n`;
    fs.appendFileSync(this.logFile, errorMessage);
    console.error(`✗ Error: ${error}`);
  }

  private loadScenario(): CodexScenario | null {
    try {
      if (!fs.existsSync(this.scenarioFile)) {
        this.logError(`${this.scenarioFile} 파일을 찾을 수 없습니다.`);
        return null;
      }

      const content = fs.readFileSync(this.scenarioFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      this.logError(`시나리오 파일 읽기 실패: ${error}`);
      return null;
    }
  }

  private loadContext(): CodexContext | null {
    try {
      if (!fs.existsSync(this.contextFile)) {
        return null;
      }

      const content = fs.readFileSync(this.contextFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      this.log(`컨텍스트 파일 읽기 실패: ${error}`);
      return null;
    }
  }

  private buildPrompt(originalPrompt: string, context: CodexContext | null): string {
    if (!context) {
      return originalPrompt;
    }

    return `[CONTEXT]
${JSON.stringify(context, null, 2)}

[INSTRUCTION]
${originalPrompt}`;
  }

  private executeCodex(prompt: string, target: string): boolean {
    try {
      // Escape prompt for shell
      const escapedPrompt = prompt.replace(/"/g, '\\"');
      const command = `codex "${escapedPrompt}" --file "${target}" --approve`;
      
      this.log(`\nExecuting: ${command}`);
      execSync(command, { stdio: 'inherit' });
      return true;
    } catch (error) {
      this.logError(`Codex 실행 실패: ${error}`);
      return false;
    }
  }

  async run(): Promise<void> {
    const scenario = this.loadScenario();
    if (!scenario) {
      return;
    }

    const context = this.loadContext();

    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i];
      this.log(`\n▶ Step ${i + 1}: ${step.description}...`);

      const prompt = this.buildPrompt(step.prompt, context);
      const success = this.executeCodex(prompt, step.target);

      if (success) {
        this.log(`✓ Step ${i + 1} 완료.`);
      } else {
        // Error handling
        console.log('\n에러가 발생했습니다. 어떻게 진행하시겠습니까?');
        console.log('1. 계속 진행 (Continue)');
        console.log('2. 중단 (Abort)');
        
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const choice = await new Promise<string>(resolve => {
          rl.question('선택 (1 또는 2): ', (answer) => {
            rl.close();
            resolve(answer.trim());
          });
        });

        if (choice === '2') {
          this.log('\n작업을 중단합니다.');
          break;
        }
      }
    }
  }
}

// Entry point
if (require.main === module) {
  const runner = new CodexRunner();
  runner.run().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
}
