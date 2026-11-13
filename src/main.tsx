import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preventZoom } from './utils/preventZoom';
import { consumeAyahLink } from './utils/ayahLink';

preventZoom();
// Dibuka dari tautan ayat yang dibagikan: langsung ke surah & ayat itu.
consumeAyahLink();

createRoot(document.getElementById('root')!).render(<App />);
