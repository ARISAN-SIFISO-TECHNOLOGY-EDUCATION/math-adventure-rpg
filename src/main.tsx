import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { PLATFORM } from './platform';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { I18nProvider } from './i18n';
import './index.css';

// Register the PWA service worker on the WEB shell only. Inside the Capacitor
// (Android/Play) WebView this is skipped, so the shipped native app is
// completely unaffected by the offline-web layer.
if (PLATFORM.isWeb && 'serviceWorker' in navigator) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => { /* SW unsupported — app still works online */ });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
);
