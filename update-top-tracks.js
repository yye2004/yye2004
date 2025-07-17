const fs = require('fs');
const yaml = require('js-yaml');

const tracks = yaml.load(fs.readFileSync('update-top-played.yml', 'utf8'));

const rows = tracks.map(t =>
  `| ![](${t.cover}) | [${t.title}](${t.url}) | ${t.artist} |`
).join('\n');

const start = '<!-- START:TOP-TRACKS -->';
const end = '<!-- END:TOP-TRACKS -->';

let readme = fs.readFileSync('README.md', 'utf8');
const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
const replacement = `${start}\n| Cover | Track | Artist |\n|-------|-------|--------|\n${rows}\n${end}`;

readme = readme.replace(pattern, replacement);
fs.writeFileSync('README.md', readme);
