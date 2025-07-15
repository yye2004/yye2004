require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

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
