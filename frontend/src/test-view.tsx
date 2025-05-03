import React from 'react';
import AgentConsole from './components/AgentConsole';

export default function TestView() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>CodexGUI Agent Console Test</h1>
      <AgentConsole />
    </div>
  );
}