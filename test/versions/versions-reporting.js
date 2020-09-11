const childProcess = require('child_process');
const fs = require('fs');
const chalk = require('chalk');
const semver = require('semver');
const packages = {
  qunit: '>= 2.0.0',
  qunitjs: '*',
  jasmine: '*',
  mocha: '*'
};

console.log();

const originalLock = fs.readFileSync('package-lock.json', 'utf8');
const originalPkg = fs.readFileSync('package.json', 'utf8');
const originalPkgObj = require('../../package.json');

/**
 * Takes each version of each framework available on npm and runs the tests
 * against it, making in the end a summary of versions which are working with
 * the js-reporters adapters and which don't.
 */
for (const pkg in packages) {
  let command = 'npm view ' + pkg + ' versions';
  const output = childProcess.execSync(command).toString()
    .replace(/[[]|]|'| |\n/g, '');
  const versions = output.split(',');
  const workingVersions = [];
  const notWorkingVersions = [];

  console.log(chalk.underline.bold.green(pkg));
  console.log();

  const versionRange = packages[pkg];
  versions.forEach(function (version) {
    if (!semver.satisfies(version, versionRange)) {
      return;
    }
    console.log(chalk.dim('Testing version: ' + version));

    command = 'npm install ' + pkg + '@' + version;
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

  module.exports[pkg] = notWorkingVersions;

  console.log();
  console.log(chalk.green('Working: ' + workingVersions.join(', ') + ';'));
  console.log(chalk.red('Not working: ' + notWorkingVersions.join(', ') + ';'));
  console.log();

  // Restore stable version to avoid polluting the next range of
  // package versions.
  command = 'npm install ' + pkg + '@' + originalPkgObj.devDependencies[pkg];
  childProcess.execSync(command, {
    stdio: ['ignore', 'ignore', 'ignore']
  });
}

// Restore package-lock.json and re-install based on that.
fs.writeFileSync('package.json', originalPkg);
fs.writeFileSync('package-lock.json', originalLock);
childProcess.execSync('npm ci', {
  stdio: ['ignore', 'ignore', 'ignore']
});
