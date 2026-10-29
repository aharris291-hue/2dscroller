// Electron downloads its program the first time it's installed. If that
// download was skipped or interrupted (a slow connection, antivirus, or npm
// settings), finish it now instead of failing with a confusing error.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = path.join(__dirname, '..', 'node_modules', 'electron');
if (!fs.existsSync(path.join(dir, 'path.txt'))) {
  console.log('Finishing the Electron download (only needed once, about 100 MB)...');
  execFileSync(process.execPath, [path.join(dir, 'install.js')], { cwd: dir, stdio: 'inherit' });
}
