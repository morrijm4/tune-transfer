'use client';

import { SubmitButton } from '../ui/submit-button';
import { useEffect, useState } from 'react';
import { generateDeveloperToken } from '@/service/apple-music/generate-developer-token';
import { saveMusicUserToken } from '@/service/apple-music/save-music-user-token';
import Form from '../ui/form';

export function AppleMusicLoginForm() {
  const [waiting, setWaiting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleMusicKitLoaded = async () => {
      console.log('MusicKit loaded');

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

  if (isLoading || waiting) {
    return <div>loading...</div>;
  }

  return (
    <Form
      action={async () => {
        const music = window.MusicKit?.getInstance();
        const musicUserToken = music?.authorize();

        setWaiting(true);

        saveMusicUserToken(await musicUserToken);
      }}
    >
      <h1>Apple Music</h1>
      <SubmitButton>Login</SubmitButton>
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
