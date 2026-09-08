import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';

/**
 * Entry point. ViteReactSSG hydrates in the browser and pre-renders the same
 * routes to HTML during `npm run build`.
 */
export const createRoot = ViteReactSSG({ routes });
