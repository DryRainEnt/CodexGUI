@echo off
cd /d %~dp0
cd frontend
call npm install
cd ..
npx ts-node tools/codex-context-generator.ts
npx ts-node tools/codex-runner.ts
cd frontend
npm run dev