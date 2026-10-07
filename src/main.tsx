import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for Progressive Web App (PWA) installation
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('PyQuest Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.log('PyQuest Service Worker registration notice:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
