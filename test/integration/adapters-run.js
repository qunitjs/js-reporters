const path = require('path');
const JsReporters = require('../../');

const testDir = path.join(__dirname, '../fixtures');

function rerequire (file) {
  const resolved = require.resolve(file);
  delete require.cache[resolved];
  return require(resolved);
}

/**
 * Exports a function for each adapter that will run
 * against a default test fixture.
 */
module.exports = {
  Jasmine: function (attachListeners) {
    const Jasmine = require('jasmine');
    const jasmine = new Jasmine();

    jasmine.loadConfig({
      spec_dir: 'test/fixtures',
      spec_files: ['jasmine.js']
    });

    const jasmineRunner = new JsReporters.JasmineAdapter(jasmine);
    attachListeners(jasmineRunner);

    jasmine.execute();
  },

  'QUnit (1.x)': function (attachListeners) {
    // Legacy npm package name
    const QUnit = require('qunitjs');
    global.QUnit = QUnit;
    QUnit.config.autorun = false;

    const qunitRunner = new JsReporters.QUnitAdapter(QUnit);
    attachListeners(qunitRunner);

    rerequire(path.join(testDir, 'qunit.js'));

    QUnit.load();
  },
  QUnit: function (attachListeners) {
    const QUnit = require('qunit');
    global.QUnit = QUnit;
    QUnit.config.autorun = false;

    const qunitRunner = new JsReporters.QUnitAdapter(QUnit);
    attachListeners(qunitRunner);

    rerequire(path.join(testDir, 'qunit.js'));

    QUnit.start();
  },
  Mocha: function (attachListeners) {
    const Mocha = require('mocha');
    const mocha = new Mocha();
    mocha.addFile(path.join(testDir, 'mocha.js'));

    const mochaRunner = new JsReporters.MochaAdapter(mocha);

    attachListeners(mochaRunner);
    mocha.run();
  }
};
