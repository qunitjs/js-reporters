/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const sinon = require('sinon');
const JsReporters = require('../../');
const data = require('./data.js');
const expect = chai.expect;

chai.use(require('sinon-chai'));

describe('Helpers', function () {
  const dummyFunc = function () {};

  describe('autoregister', function () {
    beforeEach(function () {
      global.QUnit = undefined;
      global.mocha = undefined;
      global.jasmine = undefined;
    });

    afterEach(function () {
      delete global.QUnit;
      delete global.mocha;
      delete global.jasmine;
    });

    it('should register the QUnitAdapter', function () {
      global.QUnit = {
        begin: sinon.stub(),
        testStart: dummyFunc,
        log: dummyFunc,
        testDone: dummyFunc,
        done: dummyFunc
      };

      JsReporters.autoRegister();

      expect(global.QUnit.begin).to.have.been.calledOnce;
    });

    it('should register the MochaAdapter', function () {
      global.mocha = {
        reporter: sinon.stub()
      };

      JsReporters.autoRegister();

      expect(global.mocha.reporter).to.have.been.calledOnce;
    });

    it('should register the JasmineAdapter', function () {
      const spy = sinon.stub();
      global.jasmine = {
        getEnv: function () {
          return {
            addReporter: spy
          };
        }
      };

      JsReporters.autoRegister();

      expect(spy).to.have.been.calledOnce;
    });

    it('should throw an error if no testing framework was found', function () {
      expect(JsReporters.autoRegister).to.throw(Error);
    });
  });

  describe('create functions', function () {
    it('should return a suite start', function () {
      const startSuite = JsReporters.createSuiteStart(data.startSuite);

      expect(startSuite).to.be.deep.equal(data.startSuite);
    });

    it('should return a test start', function () {
      const startTest = JsReporters.createTestStart(data.startTest);

      expect(startTest).to.be.deep.equal(data.startTest);
    });

    it('should return a test end', function () {
      const endTest = JsReporters.createTestEnd(data.endTest);

      expect(endTest).to.be.deep.equal(data.endTest);
    });

    it('should return a suite end', function () {
      const endSuite = JsReporters.createSuiteEnd(data.endSuite);

      expect(endSuite).to.be.deep.equal(data.endSuite);
    });
  });
});
