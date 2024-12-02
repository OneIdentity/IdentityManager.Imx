const path = './package-lock.json';
const fs = require('fs');
var data = require(path);

var anyChanges = false;
for (const name of [
  // these are the local packages that must not be included in package-lock.json.
  // This script removes the entries in the package-lock dependencies object
  // for these packages.

  // Add any custom API client libraries to this list (imx-api-ccc is already
  // included by default.)
  '@imx-modules/imx-api-ccc',
  '@imx-modules/imx-qbm-dbts',
  '@imx-modules/imx-api-qbm',
  '@imx-modules/imx-api-dpr',
  '@imx-modules/imx-api-tsb',
  '@imx-modules/imx-api-aob',
  '@imx-modules/imx-api-apc',
  '@imx-modules/imx-api-qer',
  '@imx-modules/imx-api-rps',
  '@imx-modules/imx-api-sac',
  '@imx-modules/imx-api-cpl',
  '@imx-modules/imx-api-pol',
  '@imx-modules/imx-api-aad',
  '@imx-modules/imx-api-rmb',
  '@imx-modules/imx-api-rms',
  '@imx-modules/imx-api-hds',
  '@imx-modules/imx-api-att',
  '@imx-modules/imx-api-uci',
  '@imx-modules/imx-api-olg',
  '@elemental-ui/core',
  '@elemental-ui/cadence-icon'
]) {
  if (data?.dependencies && data.dependencies[name]) {
    delete data.dependencies[name];
    anyChanges = true;
  }
  const nodeModuleName = 'node_modules/' + name;
  if (data.packages[nodeModuleName]) {
    delete data.packages[nodeModuleName];
    anyChanges = true;
  }
}

if (!anyChanges) {
  console.log(`No local packages to remove`);
  return;
}

// write JSON with the same indentation as npm; trimming the last line feed
var toWrite = JSON.stringify(data, null, 2) + '\n';
var error;
fs.writeFile(path, toWrite, 'utf8', (err) => {
  if (err) {
    console.log(`Error writing file: ${err}`);
    error = err;
  } else {
    console.log(`Removed local packages from package-lock`);
  }
});

if (error) throw error;
