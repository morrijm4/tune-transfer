'use server';

import { IAuthCallback } from '@/service/interface';
import { assertService, Services } from '@/service/services';
import { SpotifyAuthCallback } from '@/service/spotify/auth-callback';
import { redirect } from 'next/navigation';

export async function GET(req: Request) {
  const url = new URL(req.url);

  const service = url.searchParams.get('service');
  if (!service) {
    throw new Error('No service');
  }

  const { callback } = createAuthCallback(service);

  try {
    await callback(req);
  } catch (err) {
    console.error('Failed to save user', err);
  } finally {
    redirect('/');
  }
}
function createAuthCallback(service: string): IAuthCallback {
  assertService(service);

  switch (service) {
    case Services.Spotify:
      return new SpotifyAuthCallback();
    default:
      throw new Error('Invalid service');
  }
}
