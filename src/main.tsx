import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Ensure environment variables are loaded
if (!import.meta.env.VITE_API_KEY) {
  console.warn('API key not found in environment variables')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)