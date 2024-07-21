export type FetchOptions = {
  path: string;
  searchParams?: Record<string, string>;
};

export type AppleMusicResponse<TData> = {
  data: TData[];
  meta?: {
    total: number;
  };
};

export type ApplePlaylistResponse = AppleMusicResponse<ApplePlaylist>;

export type ApplePlaylist = {
  id: string;
  attributes?: ApplePlaylistAttributes;
};

export type ApplePlaylistAttributes = {
  name: string;
  isPublic: boolean;
  description?: {
    standard: string;
  };
  artwork?: {
    width: number | null;
    height: number | null;
    url: string;
  };
};

export type ApplePlaylistTracksResponse = AppleMusicResponse<AppleTrack>;

export type AppleTrack = {
  id: string;
  attributes?: AppleTrackAttributes;
};

export type AppleTrackAttributes = {
  albumName?: string;
  genreNames: string[];
  /** @example 2024-07-12 */
  releaseDate?: string;
  name: string;
  artistName: string;
};

export type AppleAlbumsResponse = AppleMusicResponse<AppleAlbum>;

export type AppleAlbum = {
  id: string;
  attributes?: AppleAlbumAttributes;
};

export type AppleAlbumAttributes = {
  name: string;
  /** @example 2024-07-12 */
  releaseDate?: string;
  artistName: string;
};
