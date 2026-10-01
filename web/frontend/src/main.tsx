import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';
const root = document.getElementById('root')!;
const path = window.location.pathname.replace(/\/$/, '') || '/';
if (root.querySelector('main')) hydrateRoot(root, <App path={path} />);
else createRoot(root).render(<App path={path} />);
