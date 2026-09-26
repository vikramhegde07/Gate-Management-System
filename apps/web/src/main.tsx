import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { PropertyProvider } from './context/PropertyContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PropertyProvider>
          <App />
        </PropertyProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
