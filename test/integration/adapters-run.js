var Jasmine = require('jasmine');
var QUnit = require('qunitjs');
var JsReporters = require('../../dist/js-reporters.js');

/**
 * Exports a function for each adapter that will run
 * against a default test fixture.
 */
module.exports = {
  Jasmine: function(attachListeners) {
    var jasmine = new Jasmine(),
        jasmineRunner;

    jasmine.loadConfig({
      spec_dir: 'test/jasmine',
      spec_files: [
        'tests.js'
      ]
    });

    jasmineRunner = new JsReporters.JasmineAdapter(jasmine.env);
    jasmine.addReporter({});

    attachListeners(jasmineRunner);

    jasmine.execute();
  },

  QUnit: function(attachListeners) {
    var qunitRunner = new JsReporters.QUnitAdapter(QUnit);

    attachListeners(qunitRunner);

    QUnit.config.autorun = false;

    require('../qunit/tests.js');

    QUnit.load();
  }
};
