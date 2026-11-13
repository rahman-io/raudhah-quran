import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preventZoom } from './utils/preventZoom';

preventZoom();

createRoot(document.getElementById('root')!).render(<App />);
