'use server';

import { stringify } from 'querystring';
import { redirect } from 'next/navigation';
import { clientId, redirectUrl, scope, state } from './config';

/** https://developer.spotify.com/documentation/web-api/tutorials/code-flow */
const query = stringify({
  client_id: clientId,
  redirect_uri: redirectUrl,
  state: state,
  scope: scope,
  response_type: 'code',
});

const url = `https://accounts.spotify.com/authorize?${query}`;

export async function spotifyLogin() {
  redirect(url);
}
