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

// Script to handle installing local packages living in imx-modules
// Should be run from the root imxweb dir.
// Use: node install-local-package.js <path//to//imx-modules> --skip-dialog
// --skip-dialog will auto overwrite feeds if imx-modules are present
// Optional: <path//to//imx-modules> must correspond to the physical path ../imxweb/imx-modules

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as readline from 'readline';

// Look for a positional argument to point where the imx-modules are; defaults to imx-modules
const imxModuleDir = process.argv.length > 2 ? process.argv[2] : 'imx-modules';

const isWin = process.platform === 'win32';
const nodePackageDir = '@imx-modules';
const nodeElementalDir = '@elemental-ui';
const nodeModuleDir = 'node_modules';
const cliInterface = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (str: string) => new Promise((resolve: (value: string) => void) => cliInterface.question(str, resolve));
const steps = {
  start: async () => {
    return steps.checkForModules();
  },
  checkForModules: async () => {
    if (!hasLocalPackages()) {
      console.log('No imx-modules found, keeping default feeds.');
      return steps.end();
    }
    // Check if we have auto answered yes, this is a PR build and hence want to use local packages, or if we are an external developer with no access to feeds
    if (process.env.npm_config_skip_dialog || process.env.npm_config_buildid || !installedInternalPackages()) {
      console.log('Env variable set to auto overwrite feeds or determined no feeds present and used local packages instead.')
      return steps.overwrite();
    }
    // Otherwise, this is an internal developer that has local packages and feed packages, ask what to do
    const answer = await question(
      `Found imx-modules here: ${path.resolve(imxModuleDir)}\nDo you want to overwrite the feeds?\nExternal developers are recommended to answer y: (y/n)`,
    );
    return answer.toLowerCase() === 'y' ? steps.overwrite() : steps.keepDefault();
  },
  overwrite: async () => {
    overwrite();
    return steps.end();
  },
  keepDefault: async () => {
    console.log('Keeping default feeds.');
    return steps.end();
  },
  end: async () => cliInterface.close(),
};

steps.start();

// Check if we have already gotten internal packages
function installedInternalPackages(): boolean {
  return fs.existsSync(path.join(nodeModuleDir, nodePackageDir)) && fs.existsSync(path.join(nodeModuleDir, nodeElementalDir));
}

// Check if there are local packages available
function hasLocalPackages(): boolean {
  return fs.existsSync(imxModuleDir) && fs.readdirSync(imxModuleDir).filter((file) => file.endsWith('.tgz')).length > 0;
}

function overwrite() {
  console.log('Overwriting with...');
  let installArg = '';
  let filePath;
  fs.readdirSync(imxModuleDir)
    .filter((file) => file.endsWith('.tgz'))
    .forEach((file) => {
      filePath = isWin ? path.join(imxModuleDir, file) : path.join(__dirname, imxModuleDir, file);
      if (file.includes('imx-')) {
        const baseName = path.parse(file).name;
        installArg += [nodePackageDir, '/', baseName, '@', filePath, ' '].join('');
      } else if (file.includes('cadence-icon')) {
        installArg += ['@elemental-ui/cadence-icon@', filePath, ' '].join('');
      } else if (file.includes('core')) {
        installArg += ['@elemental-ui/core@', filePath, ' '].join('');
      }
      console.log(filePath);
    });

  console.log(`\nRunning command npm i ${installArg} --save=false`);
  const child = child_process.spawnSync('npm', ['i', installArg, '--save=false'], {
    encoding: 'utf8',
    shell: true,
  });
  if (child.status === 0) {
    console.log('Overwrite Finished');
  } else {
    console.log('There was an error:');
    console.error(child.output);
    process.exit(1);
  }
}
