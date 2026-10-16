import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import { LocaleProvider } from './lib/locale';

import './index.css';

setBaseUrl(import.meta.env.BASE_URL.replace(/\/$/, ''));
createRoot(document.getElementById('root')!).render(<LocaleProvider><App /></LocaleProvider>);
