import { transfer } from '@/service/spotify/transfer';
import { Button } from '@/components/ui/button';
import { Session } from '@/lib/session';
import { AppleMusicLoginForm } from '@/components/apple-music/apple-music-login-form';
import { SpotifyLoginForm } from '@/components/spotify/spotify-login-form';

export default async function Home() {
  const session = await Session.get();

  if (session.done) {
    return <div>Transfer complete</div>;
  }

  if (session.spotify && session.appleMusicUserToken) {
    return <Button action={transfer}>Transfer</Button>;
  }

  return (
    <>
      {!session.spotify && <SpotifyLoginForm />}
      {!session.appleMusicUserToken && <AppleMusicLoginForm />}
    </>
  );
}
