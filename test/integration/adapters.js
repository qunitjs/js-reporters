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

function _overWriteTestNormalizedAssertions (test) {
  var errors = test.errors
  var assertions = test.assertions

  errors.forEach(function (error) {
    error.actual = undefined
    error.expected = undefined
    error.message = undefined
    error.stack = undefined
  })

  assertions.forEach(function (assertion) {
    assertion.actual = undefined
    assertion.expected = undefined
    assertion.message = undefined
    assertion.stack = undefined
  })
}

function _overWriteSuitesNormalizedAssertions (suite) {
  suite.tests.forEach(function (test) {
    _overWriteTestNormalizedAssertions(test)
  })

  suite.childSuites.forEach(function (childSuite) {
    _overWriteSuitesNormalizedAssertions(childSuite)
  })
}

describe('Adapters integration', function () {
  Object.keys(runAdapters).forEach(function (adapter) {
    describe(adapter + ' adapter', function () {
      var testDescription
      var keys = ['passed', 'actual', 'expected', 'message', 'stack']

      before(function (done) {
        collectedData = []
        runAdapters[adapter](_attachListeners.bind(null, done))
      })

      it('tests runtime should be a number', function () {
        collectedData.forEach(function (value) {
          if (value[0] === 'testEnd' && value[1].status !== 'skipped') {
            expect(value[1].runtime).to.be.a('number')
          }
        })
      })

      it('testing tests errors prop', function () {
        var refTestsEnd = refData.filter(function (value) {
          return value[0] === 'testEnd'
        })

        var testsEnd = collectedData.filter(function (value) {
          return value[0] === 'testEnd'
        })

        refTestsEnd.forEach(function (value, index) {
          var refTest = value[1]
          var test = testsEnd[index][1]

          if (refTest.status === 'passed' || refTest.status === 'skipped') {
            expect(test.errors).to.be.deep.equal(refTest.errors)
          } else {
            expect(test.errors).to.have.lengthOf(refTest.errors.length)

            test.errors.forEach(function (error) {
              expect(error).to.have.all.keys(keys)

              expect(error.passed).to.be.false
              expect(error.message).to.be.a('string')
              expect(error.stack).to.be.a('string')
            })
          }
        })
      })

      it('testing tests assertions prop', function () {
        var refTestsEnd = refData.filter(function (value) {
          return value[0] === 'testEnd'
        })

        var testsEnd = collectedData.filter(function (value) {
          return value[0] === 'testEnd'
        })

        refTestsEnd.forEach(function (value, index) {
          var refTest = value[1]
          var test = testsEnd[index][1]

          expect(test.assertions).to.have.lengthOf(refTest.assertions.length)

          var passedAssertions = test.assertions.filter(function (assertion) {
            return assertion.passed
          })

          var failedAssertions = test.assertions.filter(function (assertion) {
            return !assertion.passed
          })

          passedAssertions.forEach(function (assertion) {
            expect(assertion).to.have.all.keys(keys)

            expect(assertion.passed).to.be.true
            expect(assertion.message).to.be.a('string')
            expect(assertion.stack).to.be.undefined
          })

          failedAssertions.forEach(function (assertion) {
            expect(assertion).to.have.all.keys(keys)

            expect(assertion.passed).to.be.false
            expect(assertion.message).to.be.a('string')
            expect(assertion.stack).to.be.a('string')
          })
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

          // Set suite tests runtime to 0, also for the globalSuite.
          if (collectedData[index][0] === 'suiteEnd' ||
              collectedData[index][0] === 'runEnd') {
            _setSuiteTestsRuntime(collectedData[index][1])
          }

          if (collectedData[index][0] === 'testEnd') {
            _overWriteTestNormalizedAssertions(collectedData[index][1])
          }

          if (collectedData[index][0] === 'suiteEnd' ||
              collectedData[index][0] === 'runEnd') {
            _overWriteSuitesNormalizedAssertions(collectedData[index][1])
          }

          expect(collectedData[index][0]).equal(value[0])
          expect(collectedData[index][1]).to.be.deep.equal(value[1])

          // Verify the dynamic props.
          if (value[0] === 'suiteStart' || value[0] === 'runStart') {
            expect(collectedData[index][1].status).to.be.undefined
            expect(collectedData[index][1].runtime).to.be.undefined
          }

          // Verify the dynamic props.
          if (value[0] === 'suiteEnd' || value[0] === 'runEnd') {
            expect(collectedData[index][1].status).to.be.equal(value[3])

            if (collectedData[index][1].status !== 'skipped') {
              expect(collectedData[index][1].runtime).to.be.a('number')
            } else {
              expect(collectedData[index][1].runtime).to.be.undefined
            }
          }
        })
      })
    })
  })
})
