/**
 * Application entry point.
 *
 * Bootstraps TanStack Router with the auto-generated `routeTree` (produced by
 * the Vite plugin via file-based routing in `src/routes/`), then mounts the
 * React app into `#root`. The module-level `Register` augmentation enables
 * full TypeScript type-safety for route params, search params, and the
 * `useNavigate`/`useSearch` hooks throughout the codebase without any manual
 * type exports.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './index.css'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
