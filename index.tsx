/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {createRoot} from 'react-dom/client'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import './index.css'

console.log('[STORYLINES] Application starting...');
const rootElement = document.getElementById('root');
console.log('[STORYLINES] Root element found:', !!rootElement);

createRoot(rootElement!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)

console.log('[STORYLINES] React app rendered');
