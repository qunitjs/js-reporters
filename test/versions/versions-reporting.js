const childProcess = require('child_process');
const fs = require('fs');
const chalk = require('chalk');
const packages = [
  'qunitjs',
  'jasmine',
  'mocha'
];

console.log();

const originalLock = fs.readFileSync('package-lock.json', 'utf8');

/**
 * Takes each version of each framework available on npm and runs the tests
 * against it, making in the end a summary of versions which are working with
 * the js-reporters adapters and which don't.
 */
packages.forEach(function (pgk) {
  let command = 'npm view ' + pgk + ' versions';
  const output = childProcess.execSync(command).toString()
    .replace(/[[]|]|'| |\n/g, '');
  const versions = output.split(',');
  const workingVersions = [];
  const notWorkingVersions = [];

  console.log(chalk.underline.bold.green(pgk));
  console.log();

  versions.forEach(function (version) {
    console.log(chalk.dim('Testing version: ' + version));

    command = 'npm install ' + pgk + '@' + version;
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

  module.exports[pgk] = notWorkingVersions;

  console.log();
  console.log(chalk.green('Working: ' + workingVersions.join(', ') + ';'));
  console.log(chalk.red('Not working: ' + notWorkingVersions.join(', ') + ';'));
  console.log();
});

// Restore package-lock.json and re-install based on that.
fs.writeFileSync('package-lock.json', originalLock);
childProcess.execSync('npm ci', {
  stdio: ['ignore', 'ignore', 'ignore']
});
