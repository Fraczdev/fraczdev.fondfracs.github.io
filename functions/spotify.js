const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

async function refreshToken() {
  try {
    const data = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(data.body['access_token']);
    return data.body['access_token'];
  } catch (err) {
    throw err;
  }
}

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
    switch (path) {
      case 'get-token':
        const scopes = ['user-read-playback-state', 'playlist-read-private'];
        return {
          statusCode: 302,
          headers: {
            Location: spotifyApi.createAuthorizeURL(scopes)
          }
        };

      case 'callback':
        const { code } = event.queryStringParameters;
        const data = await spotifyApi.authorizationCodeGrant(code);
        console.log('Refresh token:', data.body['refresh_token']);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Check your Netlify function logs for the refresh token!' })
        };

      case 'current-playback':
        const playbackData = await spotifyApi.getMyCurrentPlaybackState();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(playbackData.body)
        };

      case 'playlist-tracks':
        const playlistData = await spotifyApi.getPlaylistTracks('37i9dQZF1EQp9BVPsNVof1');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(playlistData.body)
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
