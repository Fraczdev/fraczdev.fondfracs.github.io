require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
app.use(cors());
app.use(express.json());

// Add static file serving
app.use(express.static(__dirname));

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

// Refresh access token periodically
async function refreshToken() {
  try {
    const data = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('Token refreshed');
  } catch (err) {
    console.error('Error refreshing token:', err);
  }
}

// Refresh token every 50 minutes
setInterval(refreshToken, 50 * 60 * 1000);

app.get('/login', (req, res) => {
  const scopes = ['user-read-playback-state', 'playlist-read-private'];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);
    res.redirect('/');
  } catch (err) {
    console.error('Error getting tokens:', err);
    res.redirect('/#/error/invalid token');
  }
});

app.get('/current-playback', async (req, res) => {
  try {
    const data = await spotifyApi.getMyCurrentPlaybackState();
    res.json(data.body);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching playback state' });
  }
});

app.get('/playlist-tracks', async (req, res) => {
  try {
    const data = await spotifyApi.getPlaylistTracks('37i9dQZF1EQp9BVPsNVof1');
    res.json(data.body);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching playlist tracks' });
  }
});

const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
}); 