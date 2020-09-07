const childProcess = require('child_process');
const chalk = require('chalk');
const frameworks = ['QUnitJS', 'Jasmine', 'Mocha'];

console.log();

/**
 * Takes each version of each framework available on npm and runs the tests
 * against it, making in the end a summary of versions which are working with
 * the js-reporters adapters and which don't.
 */
frameworks.forEach(function (framework) {
  let command = 'npm view ' + framework.toLowerCase() + ' versions';
  const output = childProcess.execSync(command).toString()
    .replace(/[[]|]|'| |\n/g, '');
  const versions = output.split(',');
  const workingVersions = [];
  const notWorkingVersions = [];

  console.log(chalk.underline.bold.green(framework));
  console.log();

  versions.forEach(function (version) {
    console.log(chalk.dim('Testing version: ' + version));

    command = 'npm install ' + framework.toLowerCase() + '@' + version;
    childProcess.execSync(command, {
      stdio: ['ignore', 'ignore', 'ignore']
    });

    const details = childProcess.spawnSync('npm', ['run', 'test-integration']);

    if (details.status === 0) {
      workingVersions.push(version);
    } else {
      notWorkingVersions.push(version);
    }
  });

  module.exports[framework.toLowerCase()] = notWorkingVersions;

  console.log();
  console.log(chalk.green('Working: ' + workingVersions.join(', ') + ';'));
  console.log(chalk.red('Not working: ' + notWorkingVersions.join(', ') + ';'));
  console.log();
});

// Install the versions from package.json.
childProcess.execSync('npm install', {
  stdio: ['ignore', 'ignore', 'ignore']
});
