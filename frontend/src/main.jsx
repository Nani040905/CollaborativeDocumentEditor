import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * Main application bootstrap entry point.
 * Targets the DOM element with id 'root' and mounts the root App node.
 * Uses StrictMode to catch lifecycle bugs, deprecated patterns, and side effects.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
