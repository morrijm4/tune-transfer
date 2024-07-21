export class SpotifyQueryBuilder {
  filters: string[];

  constructor() {
    this.filters = [];
  }

  build() {
    return this.filters.join(' ');
  }

  addArtist(artist?: string) {
    if (artist) this.filters.push(`artist:${artist}`);
    return this;
  }

  addAlbum(album?: string) {
    if (album) this.filters.push(`album:${album}`);
    return this;
  }

  addTrack(track?: string) {
    if (track) this.filters.push(`track:${track}`);
    return this;
  }
}
