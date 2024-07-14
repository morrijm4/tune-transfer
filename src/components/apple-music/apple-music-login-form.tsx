'use client';

import { appleMusicLogin } from '@/service/apple-music/login';
import Form from '../ui/form';
import { SubmitButton } from '../ui/submit-button';
import { useContext } from 'react';
import { AppleMusicContext } from './apple-music.provider';

export function AppleMusicLoginForm() {
  const { isLoading, authorize } = useContext(AppleMusicContext);

  return (
    <Form action={appleMusicLogin}>
      <h1>Apple Music</h1>
      <SubmitButton disabled={isLoading} onClick={authorize}>
        Login
      </SubmitButton>
    </Form>
  );
}
