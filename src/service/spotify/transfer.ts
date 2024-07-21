'use server';

import { SpotifyClient } from '@/service/spotify/client';
import { Session } from '@/lib/session';
import { AppleMusicClient } from '../apple-music/client';
import { ApplePlaylist } from '../apple-music/types';
import { SpotifyQueryBuilder } from './query-builder';

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

  spotify.reset();
}

async function transferPlaylists() {
  const applePlaylists = await appleMusic.getPlaylists();

  for await (const applePlaylist of applePlaylists) {
    let spotifyTrackIds = [];
    const [appleTracks, spotifyPlaylistTrackNames] = await Promise.all([
      appleMusic.getPlaylistTracks(applePlaylist.id),
      spotify.getPlaylistTracksSet(applePlaylist),
    ]);

    for await (const appleTrack of appleTracks) {
      if (!appleTrack.attributes) {
        continue;
      }

      const query = new SpotifyQueryBuilder()
        .addAlbum(appleTrack.attributes.albumName)
        .addArtist(appleTrack.attributes.artistName)
        .addTrack(appleTrack.attributes?.name)
        .build();

      const spotifyTracks = await spotify.api.searchTracks(query, { limit: 1 });
      const track = spotifyTracks.body.tracks?.items.pop();

      if (!track) {
        continue;
      }

      if (spotifyPlaylistTrackNames.has(track.name)) {
        continue;
      }

      const id = isFavoriteSongs(applePlaylist) ? track.id : track.uri;
      spotifyTrackIds.push(id);

      if (isFavoriteSongs(applePlaylist) && spotifyTrackIds.length === 50) {
        await saveTracksToSpotifyPlaylist(applePlaylist, spotifyTrackIds);
        spotifyTrackIds = [];
      } else if (spotifyTrackIds.length === 100) {
        await saveTracksToSpotifyPlaylist(applePlaylist, spotifyTrackIds);
        spotifyTrackIds = [];
      }
    }

    await saveTracksToSpotifyPlaylist(applePlaylist, spotifyTrackIds);
  }
}

async function transferAlbums() {
  let spotifyAlbums = [];

  const albums = await appleMusic.getAlbums();

  for await (const album of albums) {
    if (!album.attributes) {
      continue;
    }

    const query = new SpotifyQueryBuilder()
      .addAlbum(album.attributes?.name)
      .addArtist(album.attributes.artistName)
      .build();

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

async function saveTracksToSpotifyPlaylist(
  applePlaylist: ApplePlaylist,
  spotifyTrackIds: string[]
) {
  if (isFavoriteSongs(applePlaylist)) {
    await spotify.addToMySavedTracks(spotifyTrackIds);
  } else {
    const id = await getSpotifyPlaylistId(applePlaylist);
    await spotify.addTracksToPlaylist(id, spotifyTrackIds);
  }
}

async function getSpotifyPlaylistId(applePlaylist: ApplePlaylist) {
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

function isFavoriteSongs(playlist: ApplePlaylist) {
  return playlist.attributes?.name === 'Favorite Songs';
}
