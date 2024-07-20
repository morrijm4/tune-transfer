export const clientId = '18d5f94a949240239618039808e2d039';
export const redirectUrl = process.env.SPOTIFY_REDIRECT_URI!;
export const state = 'a0ksdjvbwowa8e';
export const scope = [
  'playlist-modify-private',
  'playlist-modify-public',
  'user-read-private',
  'user-read-email',
  'user-library-modify',
].join(' ');

export const secret = process.env.SPOTIFY_CLIENT_SECRET;
if (!secret) throw new Error('No secret');

export const authorization = `Basic ${Buffer.from(
  `${clientId}:${secret}`
).toString('base64')}`;
