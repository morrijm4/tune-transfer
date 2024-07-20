'use server';

import { AppleMusicAuthCallback } from '@/service/apple-music/auth-callback';
import { IAuthCallback } from '@/service/interface';
import { assertService, Services } from '@/service/services';
import { SpotifyAuthCallback } from '@/service/spotify/auth-callback';
import { redirect } from 'next/navigation';

export async function GET(req: Request) {
  console.log('start auth callback');
  const url = new URL(req.url);

  const service = url.searchParams.get('s');
  if (!service) {
    throw new Error('No service');
  }

  const auth = createAuthCallback(service);

  try {
    await auth.callback(req);
  } catch (err) {
    console.error('Failed to save user', err);
  } finally {
    console.log('end auth callback');
    redirect('/');
  }
}
function createAuthCallback(service: string): IAuthCallback {
  assertService(service);

  switch (service) {
    case Services.Spotify:
      return new SpotifyAuthCallback();
    case Services.AppleMusic:
      return new AppleMusicAuthCallback();
    default:
      throw new Error(`Invalid service: ${service}`);
  }
}
