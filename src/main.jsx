import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WorkkarProvider } from './context/WorkkarContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WorkkarProvider>
      <App />
    </WorkkarProvider>
  </StrictMode>,
)
