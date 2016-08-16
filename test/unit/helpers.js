/* eslint-env mocha */

var chai = require('chai')
var sinon = require('sinon')
var JsReporters = require('../../dist/js-reporters.js')
var expect = chai.expect

chai.use(require('sinon-chai'))

describe('Helpers', function () {
  describe('autoregister', function () {
    it('should register the QUnitAdapter', function () {
      GLOBAL.QUnit = {}
      var spy = sinon.stub(JsReporters, 'QUnitAdapter')

      JsReporters.autoRegister()

      expect(spy).to.have.been.calledOnce

      delete GLOBAL.QUnit
    })
  })
})
