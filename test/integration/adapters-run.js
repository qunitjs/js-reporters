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
    mocha.addFile(path.join(testDir, 'mocha.js'));

    const mochaRunner = new JsReporters.MochaAdapter(mocha);

    attachListeners(mochaRunner);
    mocha.run();
  }
};
