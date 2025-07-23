const fs = require('fs');
const https = require('https');

function downloadAndEncode(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const mime = res.headers['content-type'] || 'image/jpeg';
        const base64 = buffer.toString('base64');
        resolve(`data:${mime};base64,${base64}`);
      });
    }).on('error', reject);
  });
}

async function embedImagesInSVG(filePath) {
  let svg = fs.readFileSync(filePath, 'utf8');
  const regex = /<image[^>]*href=['"]([^'"]+)['"][^>]*>/g;

  const matches = [...svg.matchAll(regex)];

  for (const match of matches) {
    const url = match[1];
    if (!url.startsWith('https://')) continue; // skip already embedded or local

    try {
      const base64 = await downloadAndEncode(url);
      svg = svg.replace(url, base64);
    } catch (err) {
      console.error(`⚠️ Failed to embed image from ${url}: ${err}`);
    }
  }

  fs.writeFileSync(filePath, svg);
  console.log(`✅ Embedded images into ${filePath}`);
}

embedImagesInSVG('top-tracks.svg');
