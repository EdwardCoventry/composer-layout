import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'example-styles/tokens.css';
import 'example-styles/components.css';
import './index.css';

const rootElement = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
