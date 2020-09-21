const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const kleur = require('kleur');
const rimraf = require('rimraf');
const semver = require('semver');

const rootDir = path.join(__dirname, '..', '..');
const logDir = path.join(rootDir, 'log');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsreptest-'));
const rootPkg = require('../../package.json');
const packages = [
  { name: 'jasmine', range: '*', default: rootPkg.devDependencies.jasmine },

  // Our adapter supports QUnit 1.19, but our integration test exercises the
  // "nested module" feature which was first released in QUnit 1.20.
  // This package goes until qunitjs@2.4.1, later releases are under 'qunit'.
  { name: 'qunitjs', range: '>= 1.20.0', default: rootPkg.devDependencies.qunitjs },

  // Ignore versions 0.x and 1.x versions of 'qunit', which were something else.
  { name: 'qunit', range: '>= 2.0.0', default: rootPkg.devDependencies.qunit },

  // Our adapter supports Mocha 1.18.0 and later.
  // Various features were missing before then.
  { name: 'mocha', range: '>= 1.18.0', default: rootPkg.devDependencies.mocha }
];

rimraf.sync(logDir);
rimraf.sync(tmpDir);

console.log();

/**
 * Takes each version of each framework available on npm and runs the tests
 * against it, making in the end a summary of versions which are working with
 * the js-reporters adapters and which don't.
 */
for (const pkg of packages) {
  const output = childProcess.execSync(`npm view ${pkg.name} versions`)
    .toString()
    .replace(/[[]|]|'| |\n/g, '');
  const versions = output.split(',');
  const workingVersions = [];
  const notWorkingVersions = [];

  console.log(kleur.green().bold().underline(pkg.name));
  console.log();

  versions.forEach(function (version) {
    if (!semver.satisfies(version, pkg.range)) {
      return;
    }
    process.stdout.write(kleur.dim(`Testing version: ${version}`));

    // Install this package in a temporary location rather overriding
    // the main package in our woring copy.
    // - Allows us to keep using the (latest) 'qunit' CLI for the integration
    //   test itself.
    // - Avoid dirtying the main package.json/package-lock.json files.
    // - Avoid false positive tests where a broken release appears to
    //   work due to other packages we have installed.
    // Note that:
    // - npm-install is "smart" and operates on the nearest "real"
    //   package even when in a sub directory. We create a local package.json
    //   file so that the directory is considered its own "package".
    // - Even when limiting require.resolve() in integration/adapters-run.js,
    //   to a specific directory, if that directory is a subdirectory of
    //   our working copy, it will still fallback to our dependencies,
    //   which can cause additional false positives. As such, create this
    //   install under os.tmpdir() instead.
    fs.mkdirSync(tmpDir);
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}');
    const others = packages
      .filter(other => other.name !== pkg.name)
      .map(other => `${other.name}@${other.default}`)
      .join(' ');
    childProcess.execSync(`npm install ${pkg.name}@${version} ${others}`, {
      cwd: tmpDir,
      stdio: ['ignore', 'ignore', 'ignore']
    });

    const details = childProcess.spawnSync('npm', ['run', 'test-integration'], {
      env: {
        ...process.env,
        JSREP_TMPDIR: tmpDir
      }
    });

    // Clean up temporary install
    rimraf.sync(tmpDir);

    let logFile;
    if (details.status === 0) {
      workingVersions.push(version);
      logFile = path.join(logDir, `passed--${pkg.name}--${version}.log`);
      process.stdout.write(kleur.dim('.') + '\n');
    } else {
      notWorkingVersions.push(version);
      logFile = path.join(logDir, `failed--${pkg.name}--${version}.log`);
      const relative = path.relative(rootDir, logFile);
      process.stdout.write(`, saved failure output to ${relative}.\n`);
    }

    fs.mkdirSync(logDir, { recursive: true });
    fs.writeFileSync(
      logFile,
      `stdout:\n\n${details.stdout}\n\n\n\nstderr:\n\n${details.stderr}\n`
    );
  });

  module.exports[pkg.name] = notWorkingVersions;

  console.log();
  console.log(kleur.green('Working: ' + workingVersions.join(', ') + ';'));
  console.log(kleur.red('Not working: ' + notWorkingVersions.join(', ') + ';'));
  console.log();
}
