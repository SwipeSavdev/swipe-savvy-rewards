import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { performanceMonitor } from './utils/performanceMonitor.ts';
// Initialize performance monitoring
performanceMonitor.init();
// Enable React strict mode for development
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
// Register Service Worker for offline support (optional)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .catch(() => console.debug('Service Worker registration failed'));
    });
}
// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
