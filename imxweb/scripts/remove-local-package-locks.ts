/*
 * ONE IDENTITY LLC. PROPRIETARY INFORMATION
 *
 * This software is confidential.  One Identity, LLC. or one of its affiliates or
 * subsidiaries, has supplied this software to you under terms of a
 * license agreement, nondisclosure agreement or both.
 *
 * You may not copy, disclose, or use this software except in accordance with
 * those terms.
 *
 *
 * Copyright 2025 One Identity LLC.
 * ALL RIGHTS RESERVED.
 *
 * ONE IDENTITY LLC. MAKES NO REPRESENTATIONS OR
 * WARRANTIES ABOUT THE SUITABILITY OF THE SOFTWARE,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, OR
 * NON-INFRINGEMENT.  ONE IDENTITY LLC. SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING
 * THIS SOFTWARE OR ITS DERIVATIVES.
 *
 */

// The .js version of this file is generated from the .ts file. Please only change the .ts file and regen via tsc.

// Script to handle removing local packages installed from the lock file
// Should be run from the root imxweb dir.
// Use: node remove-local-package-locks.js <path//to//package-lock.json>
// Optional: <path//to//package-lock.json> must correspond to the physical path ../imxweb/package-lock.json

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

// Look for a positional argument to point where the package-lock is; defaults to the current dir
const lockFile = process.argv.length > 2 ? process.argv[2] : './package-lock.json';
var lockContent: {
  dependencies: { [depName: string]: any };
  packages: { [packageName: string]: any };
  [otherProps: string]: any;
};
if (fs.existsSync(lockFile)) {
  lockContent = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
} else {
  throw `The file ${path.resolve(lockFile)} doesn't exist.`;
}

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

if (anyChanges) {
  overWriteLockFile(lockFile);
} else {
  console.log(`No local packages to remove`);
}

function overWriteLockFile(lockFile: string) {
  // write JSON with the same indentation as npm; trimming the last line feed
  var toWrite = JSON.stringify(lockContent, null, 2) + '\n';
  try {
    fs.writeFileSync(lockFile, toWrite, {
      encoding: 'utf8',
    });
  } catch (err) {
    throw err;
  } finally {
    console.log(`Removed local packages from package-lock`);
  }
}

