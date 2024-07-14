import { redirect } from 'next/navigation';
import { IAuthCallback } from '../interface';
import { authorization, redirectUrl, state as trueState } from './config';
import { timingSafeEqual } from 'crypto';
import { Session } from '@/lib/session';

export type Token = {
  /**
   * An access token that can be provided in subsequent calls, for example to Spotify Web API services.
   */
  access_token?: string;
  /**
   * How the access token may be used: always "Bearer".
   */
  token_type?: string;
  /**
   * A space-separated list of scopes which have been granted for this access_token
   */
  scope?: string;
  /**
   * The time period (in seconds) for which the access token is valid.
   */
  expires_in?: number;
  /**
   * https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens
   */
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

export class SpotifyAuthCallback implements IAuthCallback {
  #trueState = Buffer.from(trueState);

  async callback(req: Request): Promise<void> {
    const url = new URL(req.url);
    const state = url.searchParams.get('state');

    if (!this.#isStateValid(state)) {
      console.debug('Invalid state', state);
      redirect('/');
    }

    const error = url.searchParams.get('error');
    if (error) {
      console.debug('Error', error);
      redirect('/');
    }

    const code = url.searchParams.get('code');
    if (!code) {
      console.debug('No code');
      redirect('/');
    }

    const params = new URLSearchParams();

    params.set('grant_type', 'authorization_code');
    params.set('code', code);
    params.set('redirect_uri', redirectUrl);

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authorization,
      },
      body: params,
    });

    const token = await this.#parseToken(res);

    if (token.error) {
      console.error('Failed to get token', token);
    }

    if (!token.access_token) {
      console.error('No access token', token);
      redirect('/');
    }

    await using session = await Session.get();

    session.spotify = {
      accessToken: token.access_token,
    };
  }

  #isStateValid(state: string | null) {
    return state && timingSafeEqual(this.#trueState, Buffer.from(state));
  }

  async #parseToken(res: Response): Promise<Token> {
    try {
      return await res.json();
    } catch (err) {
      console.error('Failed to parse token', err);
      redirect('/');
    }
  }
}
