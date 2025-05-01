const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

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
        const scopes = [
          'user-read-playback-state',
          'playlist-read-private',
          'user-modify-playback-state'
        ];
        const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state', 'code');
        return {
          statusCode: 302,
          headers: {
            Location: authorizeURL
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
