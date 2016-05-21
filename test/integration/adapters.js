/* eslint-env mocha */

var expect = require('chai').expect
var refData = require('./reference-data.js')
var runAdapters = require('./adapters-run.js')

// Collecting the adapter's output.
var collectedData

function _collectOutput (eventName, done, eventData) {
  collectedData.push([eventName, eventData])
  done()
}

// Attaches the event handler for the runner events.
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
  Object.keys(runAdapters).forEach(function (adapter) {
    describe.skip(adapter + ' adapter', function () {
      var testDescription

      before(function (done) {
        collectedData = []
        runAdapters[adapter](_attachListeners.bind(null, done))
      })

      it('tests runtime should be between 0 and 1 ms', function () {
        collectedData.forEach(function (value) {
          if (value[0] === 'testEnd' && value[1].status !== 'skipped') {
            expect(value[1].runtime).to.be.within(0, 1)
          }
        })
      })

      refData.forEach(function (value, index) {
        testDescription = value[2]

        it(testDescription, function () {
          // Set tests runtime to 0 to match the reference tests runtime.
          if (collectedData[index][0] === 'testEnd' &&
              collectedData[index][1].status !== 'skipped') {
            collectedData[index][1].runtime = 0
          }

          expect(collectedData[index][0]).equal(value[0])
          expect(collectedData[index][1]).to.be.deep.equal(value[1])
        })
      })
    })
  })
})
