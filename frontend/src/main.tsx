import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TestView from './test-view'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestView />
  </StrictMode>,
)