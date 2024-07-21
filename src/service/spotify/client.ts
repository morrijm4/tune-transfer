import SpotifyWebApi from 'spotify-web-api-node';
import { clientId, redirectUrl, secret } from './config';

export class SpotifyClient {
  api: SpotifyWebApi;

  constructor() {
    this.api = new SpotifyWebApi({
      clientId: clientId,
      clientSecret: secret,
      redirectUri: redirectUrl,
    });
  }

  async getUserPlaylistMap() {
    const map = new Map<string, string>();
    let offset = 0;

    const playlists = await this.api.getUserPlaylists();
    console.log('Playlists:', playlists);
    const total = playlists.body.total;
    offset += playlists.body.items.length;

    for (const playlist of playlists.body.items) {
      map.set(playlist.name, playlist.id);
    }

    while (offset < total) {
      const playlists = await this.api.getUserPlaylists({ offset });

      for (const playlist of playlists.body.items) {
        map.set(playlist.name, playlist.id);
      }

      offset += playlists.body.items.length;
    }

    return map;
  }
}
