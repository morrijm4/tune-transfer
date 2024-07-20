'use server';

import SpotifyClient from 'spotify-web-api-node';
import { clientId, redirectUrl, secret } from './config';
import { Session } from '@/lib/session';
import { AppleMusicClient } from '../apple-music/client';

const spotify = new SpotifyClient({
  clientId,
  clientSecret: secret,
  redirectUri: redirectUrl,
});

const appleMusic = new AppleMusicClient();

export async function transfer() {
  console.log('Transferring Spotify data...');

  const session = await Session.get();

  if (
    !session.spotify ||
    !session.appleMusicDeveloperToken ||
    !session.appleMusicUserToken
  ) {
    throw new Error('Invalid session');
  }

  spotify.setRefreshToken(session.spotify.refreshToken);
  const refresh = await spotify.refreshAccessToken();
  spotify.setAccessToken(refresh.body.access_token);

  appleMusic.setDeveloperToken(session.appleMusicDeveloperToken);
  appleMusic.setMusicUserToken(session.appleMusicUserToken);

  const playlists = await appleMusic.getPlaylists();

  for await (const playlist of playlists) {
    const spotifyPlaylist = await spotify.createPlaylist(
      playlist.attributes.name,
      {
        description: playlist.attributes.description.standard,
        public: playlist.attributes.isPublic,
      }
    );

    const appleTracks = await appleMusic.getPlaylistTracks(playlist.id);

    const spotifyTracks = [];
    for await (const track of appleTracks) {
      const query = `track:${track.attributes.name} artist:${track.attributes.artistName} album:${track.attributes.albumName}`;
      const spotifyTrack = await spotify.searchTracks(query, { limit: 1 });

      if (spotifyTrack.body.tracks?.items.length) {
        spotifyTracks.push(spotifyTrack.body.tracks.items[0].uri);
      }
    }

    await spotify.addTracksToPlaylist(spotifyPlaylist.body.id, spotifyTracks);
  }

  const albums = await appleMusic.getAlbums();
  const spotifyAlbums = [];
  for await (const album of albums) {
    const query = `album:${album.attributes.name} artist:${album.attributes.artistName}`;
    const spotifyAlbum = await spotify.searchAlbums(query, { limit: 1 });

    if (spotifyAlbum.body.albums?.items.length) {
      spotifyAlbums.push(spotifyAlbum.body.albums.items[0].id);
    }
    await spotify.addToMySavedAlbums(spotifyAlbums);
  }

  session.done = true;
  await session.save();
}
