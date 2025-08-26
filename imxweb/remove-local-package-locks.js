const path = './package-lock.json';
const fs = require('fs');
var lockContent = require(path);

// Regex to match scoped @imx-modules/* and @elemental-ui/*
const scopedPackageRegex = /@(imx-modules|elemental-ui)\/.+$/;

var anyChanges = false;
for (const name of Object.keys({ ...lockContent.dependencies, ...lockContent.packages })) {
  if (!scopedPackageRegex.test(name)) continue;

  if (lockContent?.dependencies && lockContent.dependencies[name]) {
    delete lockContent.dependencies[name];
    anyChanges = true;
  }

  if (lockContent?.packages && lockContent.packages[name]) {
    delete lockContent.packages[name];
    anyChanges = true;
  }
}

if (!anyChanges) {
  console.log(`No local packages to remove`);
  return;
}

// write JSON with the same indentation as npm; trimming the last line feed
var toWrite = JSON.stringify(lockContent, null, 2) + '\n';
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
