import { spotifyLogin } from '@/service/spotify/login';
import Form from '../ui/form';
import { SubmitButton } from '../ui/submit-button';

export function SpotifyLoginForm() {
  return (
    <Form action={spotifyLogin}>
      <h1>Spotify</h1>
      <SubmitButton>Login</SubmitButton>
    </Form>
  );
}
