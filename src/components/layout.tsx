import type { PropsWithChildren } from 'react';
import { Nav } from './nav';

export function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Nav />
      <main className="flex min-h-screen flex-col items-center justify-between space-y-16 p-24">
        {children}
      </main>
    </>
  );
}
