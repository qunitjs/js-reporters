var expect = require('chai').expect;
var Jasmine = require('jasmine');
var JsReporters = require('../dist/js-reporters.js');
var referenceData = require('./referenceData').Jasmine;

/**
 * Object collecting Jasmine's output.
 *
 * @type {Object}
 */
var collectedData = {};

/**
 * Event handler.
 */
function _collectOutput(eventName, done, eventData) {
  // Assume now (for simplicity) that there is only one event per type.
  collectedData[eventName] = eventData;
  done();
}

/**
 * Attaches the event handler for the Jasmine runner events.
 */
function _attachListeners(runner, done) {
  var dummyFunc = function() {};

  runner.on("runStart", _collectOutput.bind(null, "runStart", dummyFunc));
  runner.on("suiteStart", _collectOutput.bind(null, "suiteStart", dummyFunc));
  runner.on("testStart", _collectOutput.bind(null, "testStart", dummyFunc));
  runner.on("testEnd", _collectOutput.bind(null, "testEnd", dummyFunc));
  runner.on("suiteEnd", _collectOutput.bind(null, "suiteEnd", dummyFunc));

  // Only when the runEnd event is emitted we can notify Mocha that we are done.
  runner.on("runEnd", _collectOutput.bind(null, "runEnd", done));
}

/**
 * Runs Jasmine programmaticaly on a test fixture for output collecting.
 */
function _getJasmineAdapterOutput(done) {
  var jasmine = new Jasmine(),
      jasmineRunner;

  jasmine.loadConfig({
    spec_dir: "test/jasmine",
    spec_files: [
      "tests.js"
    ]
  });

  jasmineRunner = new JsReporters.JasmineAdapter(jasmine.env);
  jasmine.addReporter({});

  _attachListeners(jasmineRunner, done);

  jasmine.execute();
}

describe('Jasmine Adapter', function() {
  // Run Jasmine to obtain it's output.
  before(function(done) {
    _getJasmineAdapterOutput(done);
  });

  // Now we can do assertions on the obtained output.

  describe('Global suite', function() {
    it('should have no name', function() {
      expect(referenceData[0][1].name).to.be.
        equal(collectedData.runStart.name);
    });

    it('should have all the other suites as childSuites', function() {
      expect(referenceData[0][1].childSuites).to.have.
        lengthOf(collectedData.runStart.childSuites.length);
    });
  });

  describe('Nested suites with test passing', function() {
    it('should have one passing test', function() {
      expect(referenceData[16][1].status).to.be.
        equal(collectedData.testEnd.status);
    });
  });
});
