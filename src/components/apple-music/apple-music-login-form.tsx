'use client';

import { SubmitButton } from '../ui/submit-button';
import { useEffect, useState } from 'react';
import { generateDeveloperToken } from '@/service/apple-music/generate-developer-token';
import { saveMusicUserToken } from '@/service/apple-music/save-music-user-token';
import Form from '../ui/form';

export function AppleMusicLoginForm() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleMusicKitLoaded = async () => {
      if (typeof window.MusicKit === 'undefined') {
        throw new Error('MusicKit not loaded');
      }

      await window.MusicKit.configure({
        developerToken: await generateDeveloperToken(),
        app: {
          name: 'TuneTransfer',
        },
      });
      setIsLoading(false);
    };

    document.addEventListener('musickitloaded', handleMusicKitLoaded);

    return () => {
      document.removeEventListener('musickitloaded', handleMusicKitLoaded);
    };
  }, []);

  return (
    <Form
      action={async () => {
        const music = window.MusicKit?.getInstance();
        try {
          const musicUserToken = await music?.authorize();
          saveMusicUserToken(musicUserToken);
        } catch (error) {
          console.error(error);
        }
      }}
    >
      <h1>Apple Music</h1>
      <SubmitButton disabled={isLoading}>Login</SubmitButton>
    </Form>
  );
}

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
