import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
// Runtime error overlay: catch global errors and show them in-page so
// production deploys don't just show a blank screen.
function createErrorOverlay() {
  const existing = document.getElementById('error-overlay');
  if (existing) return existing;
  const overlay = document.createElement('div');
  overlay.id = 'error-overlay';
  overlay.style.position = 'fixed';
  overlay.style.left = '0';
  overlay.style.right = '0';
  overlay.style.top = '0';
  overlay.style.zIndex = '999999';
  overlay.style.background = 'rgba(0,0,0,0.85)';
  overlay.style.color = '#fff';
  overlay.style.padding = '16px';
  overlay.style.fontFamily = 'monospace, monospace';
  overlay.style.whiteSpace = 'pre-wrap';
  overlay.style.maxHeight = '50vh';
  overlay.style.overflow = 'auto';
  overlay.style.fontSize = '13px';
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
  return overlay;
}

function showError(message) {
  try {
    const overlay = createErrorOverlay();
    overlay.textContent = message;
  } catch (e) {
    // ignore
  }
}

window.addEventListener('error', (ev) => {
  const msg = ev?.message || (ev?.error && ev.error.toString()) || 'Unknown error';
  const src = ev?.filename ? `\nFile: ${ev.filename}:${ev.lineno}:${ev.colno}` : '';
  showError(`Error: ${msg}${src}\n\n(Click to dismiss)`);
});

window.addEventListener('unhandledrejection', (ev) => {
  const reason = ev?.reason ? JSON.stringify(ev.reason, Object.getOwnPropertyNames(ev.reason)) : String(ev);
  showError(`Unhandled Promise Rejection:\n${reason}\n\n(Click to dismiss)`);
});

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
