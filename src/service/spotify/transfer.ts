'use server';

import { SpotifyClient } from '@/service/spotify/client';
import { Session } from '@/lib/session';
import { AppleMusicClient } from '../apple-music/client';
import { Playlist } from '../apple-music/types';

const spotify = new SpotifyClient();
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

  spotify.api.setRefreshToken(session.spotify.refreshToken);
  const refresh = await spotify.api.refreshAccessToken();
  spotify.api.setAccessToken(refresh.body.access_token);

  appleMusic.setDeveloperToken(session.appleMusicDeveloperToken);
  appleMusic.setMusicUserToken(session.appleMusicUserToken);

  await Promise.all([transferPlaylists(), transferAlbums()]);

  console.log('Transfer complete');

  session.done = true;
  await session.save();
}

async function transferPlaylists() {
  const applePlaylists = await appleMusic.getPlaylists();

  for await (const applePlaylist of applePlaylists) {
    const appleTracks = await appleMusic.getPlaylistTracks(applePlaylist.id);

    const spotifyTracks = [];
    for await (const track of appleTracks) {
      if (!track.attributes) {
        continue;
      }

      let query = `track:${track.attributes.name} artist:${track.attributes.artistName}`;
      if (track.attributes.albumName) {
        query += ` album:${track.attributes.albumName}`;
      }
      const spotifyTrack = await spotify.api.searchTracks(query, { limit: 1 });

      if (spotifyTrack.body.tracks?.items.length) {
        const id = isFavoriteSongs(applePlaylist)
          ? spotifyTrack.body.tracks.items[0].id
          : spotifyTrack.body.tracks.items[0].uri;

        spotifyTracks.push(id);
      }
    }

    if (isFavoriteSongs(applePlaylist)) {
      await spotify.api.addToMySavedTracks(spotifyTracks);
    } else {
      const id = await getSpotifyPlaylistId(applePlaylist);
      await spotify.api.addTracksToPlaylist(id, spotifyTracks);
    }
  }
}

async function transferAlbums() {
  const albums = await appleMusic.getAlbums();
  let spotifyAlbums = [];
  for await (const album of albums) {
    if (!album.attributes) {
      continue;
    }

    const query = `album:${album.attributes.name} artist:${album.attributes.artistName}`;
    const spotifyAlbum = await spotify.api.searchAlbums(query, { limit: 1 });

    if (spotifyAlbum.body.albums?.items.length) {
      spotifyAlbums.push(spotifyAlbum.body.albums.items[0].id);
    }

    if (spotifyAlbums.length === 50) {
      await spotify.addToMySavedAlbums(spotifyAlbums);
      spotifyAlbums = [];
    }
  }

  await spotify.addToMySavedAlbums(spotifyAlbums);
}

async function getSpotifyPlaylistId(applePlaylist: Playlist) {
  const spotifyPlaylistMap = await spotify.getUserPlaylistMap();

  const name = applePlaylist.attributes?.name;
  if (name && spotifyPlaylistMap.has(name)) {
    return spotifyPlaylistMap.get(name)!;
  }

  const spotifyPlaylist = await spotify.api.createPlaylist(
    name ?? 'My Playlist',
    {
      description: applePlaylist.attributes?.description?.standard ?? '',
      public: applePlaylist.attributes?.isPublic,
    }
  );

  return spotifyPlaylist.body.id;
}

function isFavoriteSongs(playlist: Playlist) {
  return playlist.attributes?.name === 'Favorite Songs';
}
