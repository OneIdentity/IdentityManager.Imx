// Script to handle moving plugin libraries to their respective application
// Use: node prebuild.js <app-name>
// <app-name> must correspond to the physical path i.e qer-app-portal

if (process.argv.length < 3)
{
  console.error("No application given. Please provide an application name as an argument.")
  process.exit(1)
}

const fse = require('fs-extra');
const path = require('path');
const app = process.argv[2];


const modules = getDependencies(app);
setupFiles(modules);


function getDependencies(app = "") {
  const appProject = path.join('projects', app, 'project.json')

  if (!fse.existsSync(appProject)) {
    console.error('The application given does not lead to a valid project file');
    process.exit(1);
  }
  const project = fse.readJSONSync(appProject);
  if (!project.targets.prebuild.dependsOn[0].projects) {
    console.error('The application project does not have the structure targets -> prebuild -> dependsOn -> [projects]');
    process.exit(1);
  }
  return project.targets.prebuild.dependsOn[0].projects;
}

function setupFiles(modules = []) {
  modules.forEach(module => {
    let src = path.join('dist', module);
    let dest = path.join('html', app, module);
    if (fse.existsSync(src)) {
      console.log(`Copying ${module} from ${src} folder to ${dest}...`);
      fse.copySync(src, dest);
      console.log('Finished!')
    }
    else {
      console.warn(`No ${module} artifact exists, skipping...`)
    }
  })
}
