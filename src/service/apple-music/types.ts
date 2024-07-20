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

export type PlaylistResponse = AppleMusicResponse<Playlist>;

export type Playlist = {
  id: string;
  attributes: PlaylistAttributes;
};

export type PlaylistAttributes = {
  name: string;
  isPublic: boolean;
  description: {
    standard: string;
  };
  artwork: {
    width: number;
    height: number;
    url: string;
  };
};

export type PlaylistTracksResponse = AppleMusicResponse<Track>;

export type Track = {
  id: string;
  attributes: TrackAttributes;
};

export type TrackAttributes = {
  albumName: string;
  genreNames: string[];
  /** @example 2024-07-12 */
  releaseDate: string;
  name: string;
  artistName: string;
};

export type AlbumsResponse = AppleMusicResponse<Album>;

export type Album = {
  id: string;
  attributes: AlbumAttributes;
};

export type AlbumAttributes = {
  name: string;
  /** @example 2024-07-12 */
  releaseDate: string;
  artistName: string;
};
