import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { Nav } from '@/components/nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TuneTransfer',
  description: 'Transfer your music library from Apple Music to Spotify',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script src="https://js-cdn.music.apple.com/musickit/v3/musickit.js" />
      <body className={inter.className}>
        <Nav />
        <main className="flex flex-col items-center justify-between space-y-16 mt-24 px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
