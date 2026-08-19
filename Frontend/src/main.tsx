import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import './lib/api';

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error, event.message);
  document.body.innerHTML += `<div style="color:red;z-index:9999;position:fixed;top:0;left:0;background:black;padding:20px;">${event.message} ${event.error?.stack}</div>`;
});

console.log('Mounting React app...');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
