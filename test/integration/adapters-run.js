const path = require('path');
const JsReporters = require('../../index.js');

const testDir = path.join(__dirname, '../fixtures/integration');

function rerequire (file) {
  const resolveOptions = process.env.JSREP_TMPDIR
    ? {
        // Only consider our temporary install.
        // Ignore the js-reporters own depDependencies.
        paths: [process.env.JSREP_TMPDIR]
      }
    : {};
  const resolved = require.resolve(file, resolveOptions);
  delete require.cache[resolved];
  return require(resolved);
}

/**
 * Exports a function for each adapter that will run
 * against a default test fixture.
 */
module.exports.main = {
  Jasmine: function (collectData) {
    const Jasmine = rerequire('jasmine');
    const jasmine = new Jasmine();

    jasmine.loadConfig({
      spec_dir: 'test/fixtures/integration',
      // Jasmine 3.0.0 and later use randomized order by default
      // <https://github.com/jasmine/jasmine/blob/v3.1.0/release_notes/3.0.md>
      random: false,
      spec_files: ['jasmine.js']
    });

    if (jasmine.env && jasmine.env.clearReporters) {
      // Jasmine 2.5.2 and later no longer remove the default CLI reporters
      // when calling addReporter(). Instead, it introduced clearReporters()
      // to do this manually.
      jasmine.env.clearReporters();
    }
    if (jasmine.completionReporter) {
      // Jasmine 2.5.2 and later no longer remove the default CLI reporters
      // when calling addReporter(). The clearReporters() method above removes
      // the ConsoleReporter, but theCompletionReporter that exits the process,
      // is registered late via jasmine.execute() in a way we can't remove in time.
      // Stub it instead? <https://github.com/jasmine/jasmine-npm/issues/88>
      jasmine.completionReporter.onComplete(function () {});
    }
    const jasmineRunner = new JsReporters.JasmineAdapter(jasmine);
    collectData(jasmineRunner);

    jasmine.execute();
  },

  'QUnit (1.x)': function (collectData) {
    // Legacy npm package name
    const QUnit = rerequire('qunitjs');
    global.QUnit = QUnit;
    QUnit.config.autorun = false;

    const qunitRunner = new JsReporters.QUnitAdapter(QUnit);
    collectData(qunitRunner);

    rerequire(path.join(testDir, 'qunit.js'));

    QUnit.load();
  },
  QUnit: function (collectData) {
    // Get a reporter context independent of the current integration test
    const QUnit = rerequire('qunit');
    global.QUnit = QUnit;
    QUnit.config.autorun = false;

    const qunitRunner = new JsReporters.QUnitAdapter(QUnit);
    collectData(qunitRunner);

    rerequire(path.join(testDir, 'qunit.js'));

    QUnit.start();
  },
  Mocha: function (collectData) {
    const Mocha = rerequire('mocha');
    const mocha = new Mocha();
    mocha.addFile(path.join(testDir, 'mocha.js'));

    const mochaRunner = new JsReporters.MochaAdapter(mocha);

    collectData(mochaRunner);
    mocha.run();
  }
};

module.exports.todo = {
  QUnit: function (collectData) {
    const QUnit = rerequire('qunit');
    global.QUnit = QUnit;
    QUnit.config.autorun = false;

    const qunitRunner = new JsReporters.QUnitAdapter(QUnit);
    collectData(qunitRunner);

    rerequire(path.join(testDir, 'qunit-todo.js'));

    QUnit.start();
  }
};
