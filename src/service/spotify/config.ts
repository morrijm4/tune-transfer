export const clientId = '18d5f94a949240239618039808e2d039';
export const state = 'a0ksdjvbwowa8e';
export const scope = [
  'playlist-modify-private',
  'playlist-modify-public',
  'playlist-read-private',
  'user-read-private',
  'user-read-email',
  'user-library-modify',
].join(' ');

export const redirectUrl = process.env.SPOTIFY_REDIRECT_URI!;
export const secret = process.env.SPOTIFY_CLIENT_SECRET;
if (!secret) throw new Error('No spotify client secret');
if (!redirectUrl) throw new Error('No spotify redirect uri');

export const authorization = `Basic ${Buffer.from(
  `${clientId}:${secret}`
).toString('base64')}`;
