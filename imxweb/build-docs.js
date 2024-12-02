// Script to generate documentation via compodoc.
// Use: node build-docs.js <project1> <project2>
// <projects> must correspond to the physical path i.e qer-app-portal

if (process.argv.length < 3)
{
  console.error("No project(s) given. Please provide at least one project name as an argument.");
  process.exit(1);
}

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const projects = process.argv.slice(2);

projects.forEach(project => generateDoc(project));

function generateDoc(project = "") {
  console.log(`Generating documentation for ${project}...`);
  let tsconfig = path.join('projects', project, 'tsconfig.lib.json');
  if (!fs.existsSync(tsconfig)) {
    // If lib doesn't exist, try app
    tsconfig = path.join('projects', project, 'tsconfig.app.json');
  }

  if (!fs.existsSync(tsconfig)) {
    // Both app and lib don't exist, bad dir
    console.error(`${project} doesn't have a tsconfig.lib.json or tsconfig.app.json. Moving on...\n`);
    return;
  }

  const outputpath = path.join('documentation', project);
  const child = child_process.spawnSync('compodoc', ['-p', tsconfig, '-d', outputpath], { encoding: 'utf8', shell: true });
  if (child.error) {
    console.log('ERROR: ', child.error);
    return;
  }

  console.log(`Finished - documentation available at ${outputpath}\n`);
}
