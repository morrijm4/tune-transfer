'use server';

import SpotifyClient from 'spotify-web-api-node';
import { clientId, redirectUrl, secret } from './config';
import { Session } from '@/lib/session';
import { AppleMusicClient } from '../apple-music/client';
import { Playlist } from '../apple-music/types';

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

  await Promise.all([transferPlaylists(), transferAlbums()]);

  session.done = true;
  await session.save();
}

async function transferPlaylists() {
  const playlists = await appleMusic.getPlaylists();

  for await (const playlist of playlists) {
    const appleTracks = await appleMusic.getPlaylistTracks(playlist.id);

    const spotifyTracks = [];
    for await (const track of appleTracks) {
      if (!track.attributes) {
        continue;
      }

      let query = `track:${track.attributes.name} artist:${track.attributes.artistName}`;
      if (track.attributes.albumName) {
        query += ` album:${track.attributes.albumName}`;
      }
      const spotifyTrack = await spotify.searchTracks(query, { limit: 1 });

      if (spotifyTrack.body.tracks?.items.length) {
        const id = isFavoriteSongs(playlist)
          ? spotifyTrack.body.tracks.items[0].id
          : spotifyTrack.body.tracks.items[0].uri;

        spotifyTracks.push(id);
      }
    }

    if (isFavoriteSongs(playlist)) {
      await spotify.addToMySavedTracks(spotifyTracks);
    } else {
      const spotifyPlaylist = await spotify.createPlaylist(
        playlist.attributes?.name ?? 'My Playlist',
        {
          description: playlist.attributes?.description?.standard ?? '',
          public: playlist.attributes?.isPublic,
        }
      );

      await spotify.addTracksToPlaylist(spotifyPlaylist.body.id, spotifyTracks);
    }
  }
}

async function transferAlbums() {
  const albums = await appleMusic.getAlbums();
  const spotifyAlbums = [];
  for await (const album of albums) {
    if (!album.attributes) {
      continue;
    }

    const query = `album:${album.attributes.name} artist:${album.attributes.artistName}`;
    const spotifyAlbum = await spotify.searchAlbums(query, { limit: 1 });

    if (spotifyAlbum.body.albums?.items.length) {
      spotifyAlbums.push(spotifyAlbum.body.albums.items[0].id);
    }
    await spotify.addToMySavedAlbums(spotifyAlbums);
  }
}

function isFavoriteSongs(playlist: Playlist) {
  return playlist.attributes?.name === 'Favorite Songs';
}
