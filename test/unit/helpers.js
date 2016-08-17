/* eslint-env mocha */

var chai = require('chai')
var sinon = require('sinon')
var JsReporters = require('../../dist/js-reporters.js')
var expect = chai.expect

chai.use(require('sinon-chai'))

describe('Helpers', function () {
  var dummyFunc = function () {}

  describe('autoregister', function () {
    it('should register the QUnitAdapter', function () {
      GLOBAL.QUnit = {
        begin: sinon.stub(),
        testStart: dummyFunc,
        log: dummyFunc,
        testDone: dummyFunc,
        done: dummyFunc
      }

      JsReporters.autoRegister()

      expect(GLOBAL.QUnit.begin).to.have.been.calledOnce

      delete GLOBAL.QUnit
    })

    it('should register the MochaAdapter', function () {
      GLOBAL.QUnit = undefined
      GLOBAL.mocha = {
        reporter: sinon.stub()
      }

      JsReporters.autoRegister()

      expect(GLOBAL.mocha.reporter).to.have.been.calledOnce

      delete GLOBAL.Jasmine
    })

    it('should register the JasmineAdapter', function () {
      var spy = sinon.stub()
      GLOBAL.QUnit = undefined
      GLOBAL.mocha = undefined
      GLOBAL.jasmine = {
        getEnv: function () {
          return {
            addReporter: spy
          }
        }
      }

      JsReporters.autoRegister()

      expect(spy).to.have.been.calledOnce

      delete GLOBAL.Jasmine
    })

    it('should throw an error if no testing framework was found', function () {
      GLOBAL.QUnit = undefined
      GLOBAL.mocha = undefined
      GLOBAL.jasmine = undefined

      expect(JsReporters.autoRegister).to.throw(Error)
    })
  })
})

