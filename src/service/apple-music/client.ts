import type {
  AppleAlbum,
  AppleAlbumsResponse,
  AppleMusicResponse,
  FetchOptions,
  ApplePlaylist,
  ApplePlaylistResponse,
  ApplePlaylistTracksResponse,
  AppleTrack,
} from './types';

export class AppleMusicClient {
  static limit = 100;

  #developerToken?: string;
  #musicUserToken?: string;

  #url = new URL('https://api.music.apple.com');

  async fetch<TData, TResponse extends AppleMusicResponse<TData>>({
    path,
    searchParams,
  }: FetchOptions) {
    if (!this.#developerToken || !this.#musicUserToken) {
      throw new Error('Invalid Tokens');
    }

    const url = new URL(path, this.#url);

    const params = searchParams
      ? new URLSearchParams(searchParams)
      : new URLSearchParams();

    params.set('limit', AppleMusicClient.limit.toString());
    url.search = params.toString();

    console.log('Fetching', url.href);

    const response = await fetch(url.href, {
      headers: {
        Authorization: `Bearer ${this.#developerToken}`,
        'Music-User-Token': this.#musicUserToken,
      },
    });

    if (response.status === 404) {
      return { data: [], meta: { total: 0 } };
    }

    if (!response.ok) {
      console.error(await response.text());
      throw new Error('Failed to fetch');
    }

    return response.json() as Promise<TResponse>;
  }

  async fetchIter<TData, TResponse extends AppleMusicResponse<TData>>(
    options: FetchOptions
  ): Promise<AsyncIterableIterator<TData>> {
    const fetcher = this.fetch.bind(this);

    const gen = async function* () {
      const res = await fetcher<TData, TResponse>(options);

      for (const item of res.data) {
        yield item;
      }

      const total = res.meta?.total;
      if (total === 0 || !total) {
        return;
      }

      let offset = res.data.length;
      while (total - offset > 0) {
        const res = await fetcher<TData, TResponse>({
          ...options,
          searchParams: {
            ...options.searchParams,
            offset: offset.toString(),
          },
        });

        for (const item of res.data) {
          yield item;
        }

        offset += res.data.length;
      }
    };

    return gen();
  }

  setDeveloperToken(token: string) {
    this.#developerToken = token;
  }

  setMusicUserToken(token: string) {
    this.#musicUserToken = token;
  }

  async getPlaylists() {
    return this.fetchIter<ApplePlaylist, ApplePlaylistResponse>({
      path: '/v1/me/library/playlists',
    });
  }

  async getPlaylistTracks(playlistId: string) {
    return this.fetchIter<AppleTrack, ApplePlaylistTracksResponse>({
      path: `/v1/me/library/playlists/${playlistId}/tracks`,
    });
  }

  async getAlbums() {
    return this.fetchIter<AppleAlbum, AppleAlbumsResponse>({
      path: '/v1/me/library/albums',
    });
  }
}
