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

// Recursively iterate over each suite and set their tests runtime to 0ms.
function _setSuiteTestsRuntime (suite) {
  suite.tests.forEach(function (test) {
    if (test.status !== 'skipped') {
      test.runtime = 0
    }
  })

  suite.childSuites.forEach(function (childSuite) {
    _setSuiteTestsRuntime(childSuite)
  })
}

// Recursively iterate over each suite and overwrite its errors.
function _overWriteTestsErrors (suite) {
  suite.tests.forEach(function (test) {
    if (test.status === 'failed') {
      test.errors = [new Error('error')]
    }
  })

  suite.childSuites.forEach(function (childSuite) {
    _overWriteTestsErrors(childSuite)
  })
}

describe('Adapters integration', function () {
  Object.keys(runAdapters).forEach(function (adapter) {
    describe(adapter + ' adapter', function () {
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

      if (adapter === 'QUnit') {
        it('tests errors should be QUnit errors like', function () {
          collectedData.forEach(function (value) {
            if (value[0] === 'testEnd' && value[1].status === 'failed') {
              var error = {
                actual: null,
                message: value[1].errors[0].message,
                module: value[1].suiteName,
                name: value[1].testName,
                result: false,
                runtime: value[1].runtime,
                source: 'Error: error',
                testId: value[1].errors[0].testId
              }

              expect(value[1].errors).to.be.deep.equal([error])
            }
          })
        })
      }

      refData.forEach(function (value, index) {
        testDescription = value[2]

        it(testDescription, function () {
          // Set tests runtime to 0 to match the reference tests runtime.
          if (collectedData[index][0] === 'testEnd' &&
              collectedData[index][1].status !== 'skipped') {
            collectedData[index][1].runtime = 0
          }

          // Set suite tests runtime to 0, also for the globalSuite.
          if (collectedData[index][0] === 'suiteEnd' ||
              collectedData[index][0] === 'runEnd') {
            _setSuiteTestsRuntime(collectedData[index][1])
          }

          // Overwrite QUnit error of failed tests with standard error.
          if (adapter === 'QUnit' &&
              collectedData[index][0] === 'testEnd' &&
              collectedData[index][1].status === 'failed') {
            collectedData[index][1].errors = [new Error()]
          }

          // Overwrite suite QUnit errors with standard errors.
          if (adapter === 'QUnit' &&
              (collectedData[index][0] === 'suiteEnd' ||
              collectedData[index][0] === 'runEnd')) {
            _overWriteTestsErrors(collectedData[index][1])
          }

          expect(collectedData[index][0]).equal(value[0])
          expect(collectedData[index][1]).to.be.deep.equal(value[1])
        })
      })
    })
  })
})
