import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '@assets/fonts/fonts.css'
import '@shared/styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
