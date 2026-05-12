import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { routes } from './routes';
import { bootstrapSeedSiHaceFalta } from './stores/bootstrap';

// Toma el base del bundle (configurado en vite.config.ts). En dev es '/'.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
const router = createBrowserRouter(routes, { basename });

function App() {
  useEffect(() => {
    bootstrapSeedSiHaceFalta();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
