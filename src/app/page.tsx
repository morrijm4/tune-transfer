import { spotifyTransfer } from '@/service/spotify/transfer';
import { spotifyLogin } from '@/service/spotify/login';
import { Form } from '@/components/ui/form';
import { SubmitButton } from '@/components/ui/submit-button';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Session } from '@/lib/session';
import { AppleMusicLoginForm } from '@/components/apple-music/apple-music-login-form';

export default async function Home() {
  await using session = await Session.get();

  return (
    <Layout>
      <h1>Transfer your music!</h1>
      <div className="flex flex-row flex-grow space-x-24">
        <AppleMusicLoginForm />
        <Form action={spotifyLogin}>
          <h1>Spotify</h1>
          <SubmitButton>Login</SubmitButton>
        </Form>
      </div>
      {session.spotify && <Button action={spotifyTransfer}>Transfer</Button>}
    </Layout>
  );
}
