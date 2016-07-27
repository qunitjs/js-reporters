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
    JsReporters.TapReporter.init(emitter)
  })

  it('should output the TAP header', sinon.test(function () {
    var spy = this.stub(console, 'log')

    emitter.emit('runStart', {})

    expect(spy).to.have.been.calledOnce
  }))

  it('should output ok for a passing test', sinon.test(function () {
    var spy = this.stub(console, 'log')
    var expected = 'ok 1 ' + data.passingTest.name

    emitter.emit('testEnd', data.passingTest)

    expect(spy).to.have.been.calledWith(expected)
  }))

  it('should output ok for a skipped test', sinon.test(function () {
    var spy = this.stub(console, 'log')
    var expected = 'ok 2 ' + data.skippedTest.name + ' # SKIP'

    emitter.emit('testEnd', data.skippedTest)

    expect(spy).to.have.been.calledWith(expected)
  }))

  it('should output not ok for a failing test', sinon.test(function () {
    var spy = this.stub(console, 'log')
    var expected = 'not ok 3 ' + data.failingTest.name

    emitter.emit('testEnd', data.failingTest)

    expect(spy).to.have.been.calledWith(expected)
  }))

  it('should output all errors for a failing test', sinon.test(function () {
    var spy = this.stub(console, 'log')
    var expected = []

    data.failingTest.errors.forEach(function (error) {
      expected.push('  ---')
      expected.push('  message: "' + error.toString() + '"')
      expected.push('  severity: failed')
      expected.push('  ...')
    })

    emitter.emit('testEnd', data.failingTest)

    for (var i = 0; i < expected.length; i++) {
      expect(spy).to.have.been.calledWith(expected[i])
    }
  }))

  it('should output the total number of tests', sinon.test(function () {
    var spy = this.stub(console, 'log')
    var expected = '1..4'

    emitter.emit('runEnd', {})

    expect(spy).to.have.been.calledWith(expected)
  }))
})
