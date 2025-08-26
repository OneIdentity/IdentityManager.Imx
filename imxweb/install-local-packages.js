const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });

// --skip-dialog will auto overwrite feeds if imx-modules are present

let isWin = process.platform === 'win32';
const imxModuleDir = 'imx-modules';
const nodePackageDir = '@imx-modules';
const nodeElementalDir = '@elemental-ui';
const nodeModuleDir = 'node_modules';
const question = (str) => new Promise((resolve) => readline.question(str, resolve));
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
  end: async () => readline.close(),
};

steps.start();

// Check if we have already gotten internal packages
function installedInternalPackages() {
  return fs.existsSync(path.join(nodeModuleDir, nodePackageDir)) && fs.existsSync(path.join(nodeModuleDir, nodeElementalDir));
}

// Check if there are local packages available
function hasLocalPackages() {
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
        installArg += ['@', imxModuleDir, '/', baseName, '@', filePath, ' '].join('');
      } else if (file.includes('cadence-icon')) {
        installArg += ['@elemental-ui/cadence-icon@', filePath, ' '].join('');
      } else if (file.includes('core')) {
        installArg += ['@elemental-ui/core@', filePath, ' '].join('');
      }
      console.log(filePath);
    });

  console.log(`Running command npm i ${installArg} --save=false`);
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
