'use server';

import Spotify from 'spotify-web-api-node';
import { clientId, redirectUrl, secret } from './config';
import { Session } from '@/lib/session';

// TODO: Implement refresh token
const spotify = new Spotify({
  clientId,
  clientSecret: secret,
  redirectUri: redirectUrl,
});

export async function spotifyTransfer() {
  console.log('Transferring Spotify data...');

  await using session = await Session.get();
  session.print();

  if (!session.spotify) {
    throw new Error('No Spotify data found');
  }

  spotify.setAccessToken(session.spotify.accessToken);
}
