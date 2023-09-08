const path = './package-lock.json';
var data = require(path);
var anyChanges = false;
for (const name of [

  // these are the local packages that must not be included in package-lock.json.
  // This script removes the entries in the package-lock dependencies object
  // for these packages.

  // Add any custom API client libraries to this list (imx-api-ccc is already
  // included by default.)
  'imx-api-ccc',
  'imx-qbm-dbts',
  'imx-api-qbm',
  'imx-api-dpr',
  'imx-api-tsb',
  'imx-api-aob',
  'imx-api-apc',
  'imx-api-qer',
  'imx-api-rps',
  'imx-api-sac',
  'imx-api-cpl',
  'imx-api-pol',
  'imx-api-aad',
  'imx-api-o3t',
  'imx-api-rmb',
  'imx-api-rms',
  'imx-api-hds',
  'imx-api-att',
  'imx-api-uci',
  'imx-api-olg',
  'imx-api-o3e'
]) {
  if (data.dependencies[name]) {
    delete data.dependencies[name];
    anyChanges = true;
  }
}

if (!anyChanges) {
  console.log(`No local packages to remove`);
  return;
}
const fs = require('fs');

// write JSON with the same indentation as npm; trimming the last line feed
var toWrite = JSON.stringify(data, null, 2) + '\n';
var error;
fs.writeFile(path, toWrite, 'utf8', err => {
  if (err) {
    console.log(`Error writing file: ${err}`);
    error = err;
  } else {
    console.log(`Removed local packages from package-lock`);
  }
});

if (error)
  throw error;
