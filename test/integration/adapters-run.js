const Jasmine = require('jasmine');
const QUnit = require('qunitjs');
const Mocha = require('mocha');
const JsReporters = require('../../');
const path = require('path');

const testDir = path.join(__dirname, '../fixtures');

/**
 * Exports a function for each adapter that will run
 * against a default test fixture.
 */
module.exports = {
  Jasmine: function (attachListeners) {
    const jasmine = new Jasmine();
    jasmine.loadConfig({
      spec_dir: 'test/fixtures',
      spec_files: ['jasmine.js']
    });

    const jasmineRunner = new JsReporters.JasmineAdapter(jasmine);

    attachListeners(jasmineRunner);

    jasmine.execute();
  },

  QUnit: function (attachListeners) {
    const qunitRunner = new JsReporters.QUnitAdapter(QUnit);

    attachListeners(qunitRunner);

    QUnit.config.autorun = false;

    require(path.join(testDir, 'qunit.js'));

    QUnit.load();
  },

  Mocha: function (attachListeners) {
    const mocha = new Mocha();
    const origWrite = process.stdout.write;

    mocha.addFile(path.join(testDir, 'mocha.js'));

    const mochaRunner = new JsReporters.MochaAdapter(mocha);

    attachListeners(mochaRunner);

    // Surpress output, so that Mocha's default reporter output will not be
    // displayed during testing.
    process.stdout.write = function () {};

    mocha.run(function () {
      // Restore output.
      process.stdout.write = origWrite;
    });
  }
};
