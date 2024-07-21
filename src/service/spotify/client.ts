import SpotifyWebApi from 'spotify-web-api-node';
import { clientId, redirectUrl, secret } from './config';
import type {
  PagingObject,
  Response,
  GetUserPlaylistsResponse,
  GetUserPlaylistsBody,
  GetUserPlaylistsItem,
  GetPlaylistTracksResponse,
  GetPlaylistTracksBody,
  GetPlaylistTracksItem,
  GetPlaylistTracksParams,
} from './types';
import type { ApplePlaylist } from '../apple-music/types';

export class SpotifyClient {
  api: SpotifyWebApi;

  userPlaylistMap?: Map<string, string>;

  constructor() {
    this.api = new SpotifyWebApi({
      clientId: clientId,
      clientSecret: secret,
      redirectUri: redirectUrl,
    });
  }

  createPaginator<
    TResult extends Response<TPage>,
    TPage extends PagingObject<TItem>,
    TItem
  >(fn: (offset: number) => Promise<TResult>): AsyncIterableIterator<TItem> {
    const func = fn.bind(this.api);

    const gen = async function* () {
      let offset = 0;

      let total = 0;
      let items: TItem[] = [];

      do {
        const res = await func(offset);

        total = res.body.total;
        items = res.body.items;

        for (const item of items) {
          yield item;
        }

        offset += items.length;
      } while (offset < total);
    };

    return gen();
  }

  reset() {
    this.api.resetAccessToken();
    this.api.resetRefreshToken();
    this.userPlaylistMap = undefined;
  }

  getUserPlaylistsPaginator() {
    return this.createPaginator<
      GetUserPlaylistsResponse,
      GetUserPlaylistsBody,
      GetUserPlaylistsItem
    >((offset) => this.api.getUserPlaylists({ limit: 50, offset }));
  }

  getPlaylistTracksPaginator(
    ...[playlistId, options]: GetPlaylistTracksParams
  ) {
    return this.createPaginator<
      GetPlaylistTracksResponse,
      GetPlaylistTracksBody,
      GetPlaylistTracksItem
    >((offset) =>
      this.api.getPlaylistTracks(playlistId, { limit: 100, ...options, offset })
    );
  }

  async getPlaylistTracksSet(applePlaylist: ApplePlaylist) {
    const name = applePlaylist.attributes?.name;
    const spotifyPlaylistMap = await this.getUserPlaylistMap();

    const set = new Set<string>();
    if (name && spotifyPlaylistMap.has(name)) {
      const playlistId = spotifyPlaylistMap.get(name)!;

      const tracks = this.getPlaylistTracksPaginator(playlistId, {
        fields: 'total,items.track.name',
      });

      for await (const { track } of tracks) {
        if (track) set.add(track.name);
      }
    }

    return set;
  }

  async getUserPlaylistMap() {
    if (!this.userPlaylistMap) {
      this.userPlaylistMap = new Map();

      const playlists = this.getUserPlaylistsPaginator();

      for await (const playlist of playlists) {
        this.userPlaylistMap.set(playlist.name, playlist.id);
      }
    }

    return this.userPlaylistMap;
  }

  /**
   * Add an album from the authenticated user's Your Music library.
   * @param {string[]} albumIds The track IDs
   * @returns {Promise|undefined} A promise that if successful returns null, otherwise an error. Not returned if a callback is given.
   */
  async addToMySavedAlbums(ids: string[]) {
    if (ids.length) {
      await this.api.addToMySavedAlbums(ids);
    }
  }

  /**
   * Add a track from the authenticated user's Your Music library.
   * @param {string[]} trackIds The track IDs
   * @returns {Promise|undefined} A promise that if successful returns null, otherwise an error. Not returned if a callback is given.
   */
  async addToMySavedTracks(ids: string[]) {
    if (ids.length) {
      await this.api.addToMySavedTracks(ids);
    }
  }

  /**
   * Add tracks to a playlist.
   * @param {string} playlistId The playlist's ID
   * @param {string[]} tracks URIs of the tracks to add to the playlist.
   * @example await addTracksToPlaylist('3EsfV6XzCHU8SPNdbnFogK',
              '["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"]');
   * @returns {Promise|undefined} A promise that if successful returns an object containing a snapshot_id. If rejected,
   * it contains an error object. Not returned if a callback is given.
   */
  async addTracksToPlaylist(playlistId: string, trackIds: string[]) {
    if (trackIds.length) {
      return await this.api.addTracksToPlaylist(playlistId, trackIds);
    }
  }
}
