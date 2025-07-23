const fs = require('fs');
const axios = require('axios');

async function toBase64(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`❌ Failed to download image from ${url}:`, error.message);
    return null;
  }
}

async function embedImagesInSVG(filePath) {
  let svg = fs.readFileSync(filePath, 'utf8');

  const regex = /<image([^>]+)href=['"]([^'"]+)['"]([^>]*)>/g;
  const matches = [...svg.matchAll(regex)];

  for (const match of matches) {
    const fullTag = match[0];
    const prefix = match[1];
    const url = match[2];
    const suffix = match[3];

    if (!url.startsWith('https://')) continue;

    const base64 = await toBase64(url);
    if (base64) {
      const newTag = `<image${prefix}href="${base64}"${suffix}>`;
      svg = svg.replace(fullTag, newTag);
    }
  }

  fs.writeFileSync(filePath, svg, 'utf8');
  console.log(`✅ All external images in ${filePath} have been embedded as Base64.`);
}

embedImagesInSVG('top-tracks.svg');
