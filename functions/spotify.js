const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

spotifyApi.setRefreshToken(process.env.SPOTIFY_REFRESH_TOKEN);

const scopes = [
  'user-read-playback-state',
  'playlist-read-private',
  'user-modify-playback-state',
  'streaming',
  'user-read-email',
  'user-read-private',
  'app-remote-control'
];

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
    const refreshData = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(refreshData.body['access_token']);

    switch (path) {
      case 'callback':
        const { code } = event.queryStringParameters || {};
        if (!code) {
          const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
          return {
            statusCode: 302,
            headers: { ...headers, Location: authorizeURL },
            body: ''
          };
        }
        const data = await spotifyApi.authorizationCodeGrant(code);
        console.log('Refresh token:', data.body['refresh_token']);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Check your Netlify function logs for the refresh token!' })
        };

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

      case 'get-token':
        const tokenData = await spotifyApi.refreshAccessToken();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ access_token: tokenData.body.access_token })
        };

      case 'transfer-playback':
        const { device_id } = JSON.parse(event.body);
        await spotifyApi.transferMyPlayback([device_id]);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };

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
