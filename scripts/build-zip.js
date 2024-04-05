const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

const cwd = process.cwd();
function resolve(...dir) {
  return path.join(cwd, ...dir);
}

const DEST_ZIP_DIR = resolve('./dist-zip');

const hyphenate = (str) => {
  return str.split(' ').reduce((i, j) => {
    i = i ? i + '-' : i;
    return i + j.toLowerCase();
  }, '');
};

function main() {
  const { name, version } = require('../dist/manifest.json');
  const zipFilename = `${hyphenate(name)}-v${version}.zip`;

  fs.emptyDirSync(DEST_ZIP_DIR);

  console.info(`Building ${zipFilename}...`);
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(path.join(DEST_ZIP_DIR, zipFilename));

  archive.directory('dist', false).pipe(stream);

  archive.finalize();
}

main();
