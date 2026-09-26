import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Prerendered HTML starts with ordinary head tags.  Hand them to Helmet before
// React mounts so a client-side route change replaces them instead of leaving
// a stale canonical, robots directive, or duplicate description behind.
document.head.querySelectorAll(
  'meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], script[type="application/ld+json"]',
).forEach((element) => element.setAttribute('data-rh', 'true'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
