/* eslint-env mocha */

var chai = require('chai')
var sinon = require('sinon')
var JsReporters = require('../../dist/js-reporters.js')
var expect = chai.expect

chai.use(require('sinon-chai'))

describe('Helpers', function () {
  var dummyFunc = function () {}

  describe('autoregister', function () {
    beforeEach(function () {
      global.QUnit = undefined
      global.mocha = undefined
      global.jasmine = undefined
    })

    afterEach(function () {
      delete global.QUnit
      delete global.mocha
      delete global.jasmine
    })

    it('should register the QUnitAdapter', function () {
      global.QUnit = {
        begin: sinon.stub(),
        testStart: dummyFunc,
        log: dummyFunc,
        testDone: dummyFunc,
        done: dummyFunc
      }

      JsReporters.autoRegister()

      expect(global.QUnit.begin).to.have.been.calledOnce
    })

    it('should register the MochaAdapter', function () {
      global.mocha = {
        reporter: sinon.stub()
      }

      JsReporters.autoRegister()

      expect(global.mocha.reporter).to.have.been.calledOnce
    })

    it('should register the JasmineAdapter', function () {
      var spy = sinon.stub()
      global.jasmine = {
        getEnv: function () {
          return {
            addReporter: spy
          }
        }
      }

      JsReporters.autoRegister()

      expect(spy).to.have.been.calledOnce
    })

    it('should throw an error if no testing framework was found', function () {
      expect(JsReporters.autoRegister).to.throw(Error)
    })
  })
})

