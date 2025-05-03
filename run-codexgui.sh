#!/bin/bash
cd "$(dirname "$0")"
cd frontend
npm install
cd ..
npx ts-node tools/codex-context-generator.ts
npx ts-node tools/codex-runner.ts
cd frontend
npm run dev