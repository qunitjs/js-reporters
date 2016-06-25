/* eslint-env mocha */

var chai = require('chai')
var sinon = require('sinon')
var EventEmitter = require('events').EventEmitter
var JsReporters = require('../../dist/js-reporters.js')
var data = require('./data.js')
var expect = chai.expect

chai.use(require('sinon-chai'))

describe('Tap reporter', function () {
  var emitter

  before(function () {
    emitter = new EventEmitter()
    var reporter = new JsReporters.TapReporter(emitter)
  })

  it('should output the TAP header', function () {
    var spy = sinon.stub(console, 'log')

    emitter.emit('runStart', {})
    console.log.restore()

    expect(spy).to.have.been.calledOnce
  })

  it('should output ok for a passing test', function () {
    var spy = sinon.stub(console, 'log')
    var expected = 'ok 1 ' + data.passingTest.testName

    emitter.emit('testEnd', data.passingTest)
    console.log.restore()

    expect(spy).to.have.been.calledWith(expected)
  })

  it('should output ok for a skipped test', function () {
    var spy = sinon.stub(console, 'log')
    var expected = 'ok 2 ' + data.skippedTest.testName + ' # SKIP'

    emitter.emit('testEnd', data.skippedTest)
    console.log.restore()

    expect(spy).to.have.been.calledWith(expected)
  })

  it('should output not ok for a failing test', function () {
    var spy = sinon.stub(console, 'log')
    var expected = 'not ok 3 ' + data.failingTest.testName

    emitter.emit('testEnd', data.failingTest)
    console.log.restore()

    expect(spy).to.have.been.calledWith(expected)
  })

  it('should output all errors for a failing test', function () {
    var spy = sinon.stub(console, 'log')
    var expected = []

    data.failingTest.errors.forEach(function (error) {
      expected.push('  ---')
      expected.push('  message: "' + error.toString() + '"')
      expected.push('  severity: failed')
      expected.push('  ...')
    })

    emitter.emit('testEnd', data.failingTest)
    console.log.restore()

    for (var i = 0; i < expected.length; i++) {
      expect(spy).to.have.been.calledWith(expected[i])
    }
  })

  it('should output the total number of tests', function () {
    var spy = sinon.stub(console, 'log')
    var expected = '1..4'

    emitter.emit('runEnd', {})
    console.log.restore()

    expect(spy).to.have.been.calledWith(expected)
  })
})
