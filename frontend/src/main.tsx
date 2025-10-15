import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App';
import { setAuthToken } from './lib/api';


try {
  const token = localStorage.getItem('auth_token');
  if (token) setAuthToken(token);
} catch (e) {

}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
