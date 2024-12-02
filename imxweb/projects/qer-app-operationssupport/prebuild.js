const fs = require('fs');
const src = 'dist/uci';
const dest = 'html/qer-app-operationssupport/uci';

console.log(`Copy uci from ${src} folder to ${dest}`);
fs.cpSync(src, dest, { recursive: true });
