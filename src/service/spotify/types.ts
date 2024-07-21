import type { Methods, MethodNames } from '@/lib/types-utils';
import SpotifyWebApi from 'spotify-web-api-node';

export interface Response<T> {
  body: T;
  headers: Record<string, string>;
  statusCode: number;
}

/**
 * Paging Object wrapper used for retrieving collections from the Spotify API.
 * [](https://developer.spotify.com/web-api/object-model/#paging-object)
 */
export interface PagingObject<T> {
  items: T[];
  total: number;
}

export type SpotifyWebApiInstance = InstanceType<typeof SpotifyWebApi>;
export type SpotifyWebApiInstanceMethods = Methods<SpotifyWebApiInstance>;
export type SpotifyWebApiInstanceMethodNames =
  MethodNames<SpotifyWebApiInstance>;

export type GetUserPlaylistsResponse = Awaited<
  ReturnType<SpotifyWebApiInstanceMethods['getUserPlaylists']>
>;
export type GetUserPlaylistsBody = GetUserPlaylistsResponse['body'];
export type GetUserPlaylistsItem = GetUserPlaylistsBody['items'][number];
export type GetUserPlaylistParams = Parameters<
  SpotifyWebApiInstanceMethods['getUserPlaylists']
>;

export type GetPlaylistTracksResponse = Awaited<
  ReturnType<SpotifyWebApiInstanceMethods['getPlaylistTracks']>
>;
export type GetPlaylistTracksBody = GetPlaylistTracksResponse['body'];
export type GetPlaylistTracksItem = GetPlaylistTracksBody['items'][number];
export type GetPlaylistTracksParams = Parameters<
  SpotifyWebApiInstanceMethods['getPlaylistTracks']
>;
