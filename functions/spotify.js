const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

spotifyApi.setRefreshToken(process.env.SPOTIFY_REFRESH_TOKEN);

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const path = event.path.split('/').pop();

  try {
    // Refresh the access token first
    const refreshData = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(refreshData.body['access_token']);

    switch (path) {
      case 'current-playback':
        const playbackData = await spotifyApi.getMyCurrentPlaybackState();
        console.log('API response:', playbackData.body); // Debug log
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(playbackData.body)
        };

      case 'playlist-tracks':
        try {
          const playlistData = await spotifyApi.getPlaylistTracks('37i9dQZF1EQp9BVPsNVof1');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(playlistData.body)
          };
        } catch (error) {
          console.error('Playlist error:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch playlist' })
          };
        }

      case 'toggle-playback':
        const currentPlayback = await spotifyApi.getMyCurrentPlaybackState();
        if (currentPlayback.body.is_playing) {
          await spotifyApi.pause();
        } else {
          await spotifyApi.play();
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };

      case 'set-volume':
        try {
          const { volume } = JSON.parse(event.body || '{}');
          if (typeof volume !== 'number') {
            throw new Error('Invalid volume value');
          }
          await spotifyApi.setVolume(volume);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
          };
        } catch (error) {
          console.error('Volume error:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to set volume' })
          };
        }

      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Not Found' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
