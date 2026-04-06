import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import type { PGlite } from '@electric-sql/pglite';

export interface RouterContext {
  db: PGlite;
}

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    db: undefined as unknown as PGlite,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
