/* eslint-env mocha */

var expect = require('chai').expect
var data = require('../referenceData')
var runAdapters = require('./adapters-run.js')

/**
 * Object collecting the Adapter's output.
 *
 * @type {Object}
 */
var collectedData = {}

/**
 * @type {Array}
 * @const
 */
const adapters = ['Jasmine', 'QUnit', 'Mocha']

/**
 * Event handler.
 */
function _collectOutput (eventName, done, eventData) {
  // Assume now (for simplicity) that there is only one event per type.
  collectedData[eventName] = eventData
  done()
}

/**
 * Attaches the event handler for the Jasmine runner events.
 */
function _attachListeners (done, runner) {
  var dummyFunc = function () {}

  runner.on('runStart', _collectOutput.bind(null, 'runStart', dummyFunc))
  runner.on('suiteStart', _collectOutput.bind(null, 'suiteStart', dummyFunc))
  runner.on('testStart', _collectOutput.bind(null, 'testStart', dummyFunc))
  runner.on('testEnd', _collectOutput.bind(null, 'testEnd', dummyFunc))
  runner.on('suiteEnd', _collectOutput.bind(null, 'suiteEnd', dummyFunc))

  // Only when the runEnd event is emitted we can notify Mocha that we are done.
  runner.on('runEnd', _collectOutput.bind(null, 'runEnd', done))
}

describe('Adapters integration', function () {
  adapters.forEach(function (adapter) {
    describe(adapter + ' adapter', function () {
      var referenceData = data[adapter]

      before(function (done) {
        collectedData = {}
        runAdapters[adapter](_attachListeners.bind(null, done))
      })

      describe('Global suite', function () {
        it('should have no name', function () {
          expect(referenceData[0][1].name).to.be.equal(collectedData.runStart.name)
        })

        it('should have all the other suites as childSuites', function () {
          expect(referenceData[0][1].childSuites).to.have.lengthOf(collectedData.runStart.childSuites.length)
        })
      })
    })
  })
})
