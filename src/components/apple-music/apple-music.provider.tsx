'use client';

import Script from 'next/script';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';

type AppleMusicContextValue = {
  isLoading: boolean;
  authorize(): void;
};

export function AppleMusicProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);

  const handleMusicKitLoaded = useCallback(async () => {
    if (typeof window.MusicKit === 'undefined') {
      throw new Error('MusicKit not loaded');
    }

    await window.MusicKit.configure({
      developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN!,
      app: {
        name: 'TuneTransfer',
      },
    });

    setIsLoading(false);
  }, []);

  useEffect(() => {
    document.addEventListener('musickitloaded', handleMusicKitLoaded);

    return () => {
      document.removeEventListener('musickitloaded', handleMusicKitLoaded);
    };
  }, [handleMusicKitLoaded]);

  return (
    <>
      <Script
        src="https://js-cdn.music.apple.com/musickit/v3/musickit.js"
        async
      />
      <AppleMusicContext.Provider
        value={{
          authorize: () => window.MusicKit?.getInstance()?.authorize(),
          isLoading,
        }}
      >
        {children}
      </AppleMusicContext.Provider>
    </>
  );
}

export const AppleMusicContext = createContext<AppleMusicContextValue>({
  isLoading: true,
  authorize() {
    throw new Error('Not initialized');
  },
});

AppleMusicContext.displayName = 'AppleMusicContext';

declare global {
  interface Window {
    MusicKit?: {
      configure(options: MusicKitConfiguration): Promise<void>;
      getInstance(): MusicKitInstance | undefined;
    };
  }

  /** https://js-cdn.music.apple.com/musickit/v3/docs/iframe.html?id=reference-javascript-musickit--page&viewMode=story&args=#musickitconfiguration */
  type MusicKitConfiguration = {
    developerToken: string;
    app: {
      name: string;
      build?: string;
      icon?: string;
    };
  };

  type MusicKitInstance = {
    /** https://js-cdn.music.apple.com/musickit/v3/docs/iframe.html?id=reference-javascript-musickit-instance--page&viewMode=story&args=#authorize */
    authorize(): Promise<string | undefined>;
  };
}
