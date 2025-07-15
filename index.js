require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const express = require('express');
const axios = require('axios');
const app = express();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = 'https://yye-spotify.onrender.com/callback';

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  if (!code) {
    return res.status(400).send('No code found in query');
  }

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
      },
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri
      }).toString()
    });

    const { access_token, refresh_token, expires_in } = response.data;

    // For now, just show tokens (in real life, save refresh_token securely)
    res.send(`
      <h2>Spotify tokens received!</h2>
      <p><strong>Access Token:</strong> ${access_token}</p>
      <p><strong>Refresh Token:</strong> ${refresh_token}</p>
      <p><strong>Expires In:</strong> ${expires_in} seconds</p>
      <p>Copy your refresh token and set it as an environment variable.</p>
    `);

  } catch (error) {
    console.error('Error getting tokens:', error.response?.data || error.message);
    res.status(500).send('Failed to get tokens from Spotify.');
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }), {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data.access_token;
}

app.get('/api/top-played', async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const { data } = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=5', {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('✅ Server is up and running!');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
