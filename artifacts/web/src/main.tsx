import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import { LocaleProvider } from './lib/locale';

import './index.css';

setBaseUrl(import.meta.env.BASE_URL.replace(/\/$/, ''));

// Site-wide: only one native video plays at a time (Task 33).
document.addEventListener('play', (e) => {
  const t = e.target;
  if (!(t instanceof HTMLVideoElement)) return;
  document.querySelectorAll('video').forEach((v) => { if (v !== t && !v.paused && !v.muted) v.pause(); });
}, true);
createRoot(document.getElementById('root')!).render(<LocaleProvider><App /></LocaleProvider>);
