import ReactDOM from 'react-dom/client';
import App from './App';
import 'katex/dist/katex.min.css';
import './index.css';

// No StrictMode: the whiteboard manages raw pointer listeners and a canvas, and
// StrictMode's dev double-invoke makes that needlessly fiddly.
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
