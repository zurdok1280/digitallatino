import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Crear root con configuración optimizada
const root = createRoot(document.getElementById("root")!, {
  // Configuraciones de rendimiento
  onRecoverableError: (error) => {
    console.warn('Recoverable error:', error);
  },
});

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
