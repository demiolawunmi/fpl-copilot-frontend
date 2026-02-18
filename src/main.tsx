import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { TeamIdProvider } from './context/TeamIdContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TeamIdProvider>
        <App />
      </TeamIdProvider>
    </BrowserRouter>
  </StrictMode>,
)
