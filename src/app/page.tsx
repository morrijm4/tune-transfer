import { Session } from '@/lib/session';
import { AppleMusicLoginForm } from '@/components/apple-music/apple-music-login-form';
import { SpotifyLoginForm } from '@/components/spotify/spotify-login-form';
import { Transfer } from '@/components/transfer';

export const maxDuration = 60; // seconds

export default async function Home() {
  const session = await Session.get();

  return (
    <>
      <h1 className="text-2xl text-center">
        Transfer your playlists, albums, and favorite songs from Apple Music to
        Spotify.
      </h1>
      {session.spotify && session.appleMusicUserToken && <Transfer />}
      {!session.spotify && <SpotifyLoginForm />}
      {!session.appleMusicUserToken && <AppleMusicLoginForm />}
    </>
  );
}
