import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'example-styles/tokens.css';
import 'example-styles/components.css';
import './index.css';

const rootEl = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <div className="quiz-root">
      <App />
    </div>
  </React.StrictMode>
);
