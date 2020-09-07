/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const chalk = require('chalk');
const sinon = require('sinon');
const EventEmitter = require('events').EventEmitter;
const JsReporters = require('../../');
const data = require('./data.js');
const expect = chai.expect;

chai.use(require('sinon-chai'));

describe('Tap reporter', function () {
  let emitter;

  before(function () {
    emitter = new EventEmitter();
    JsReporters.TapReporter.init(emitter);
  });

  it('should output the TAP header', sinon.test(function () {
    const spy = this.stub(console, 'log');

    emitter.emit('runStart', {});

    expect(spy).to.have.been.calledOnce;
  }));

  it('should output ok for a passing test', sinon.test(function () {
    const spy = this.stub(console, 'log');
    const expected = 'ok 1 ' + data.passingTest.fullName.join(' > ');

    emitter.emit('testEnd', data.passingTest);

    expect(spy).to.have.been.calledWith(expected);
  }));

  it('should output ok for a skipped test', sinon.test(function () {
    const spy = this.stub(console, 'log');
    const expected = chalk.yellow('ok 2 # SKIP ' + data.skippedTest.fullName.join(' > '));

    emitter.emit('testEnd', data.skippedTest);

    expect(spy).to.have.been.calledWith(expected);
  }));

  it('should output not ok for a todo test', sinon.test(function () {
    const spy = this.stub(console, 'log');
    const expected = chalk.cyan('not ok 3 # TODO ' + data.todoTest.fullName.join(' > '));

    emitter.emit('testEnd', data.todoTest);

    expect(spy).to.have.been.calledWith(expected);
  }));

  it('should output not ok for a failing test', sinon.test(function () {
    const spy = this.stub(console, 'log');
    const expected = chalk.red('not ok 4 ' + data.failingTest.fullName.join(' > '));

    emitter.emit('testEnd', data.failingTest);

    expect(spy).to.have.been.calledWith(expected);
  }));

  it('should output all errors for a failing test', sinon.test(function () {
    const spy = this.stub(console, 'log');

    emitter.emit('testEnd', data.failingTest);
    for (let i = 0; i < data.failingTapData.length; i++) {
      expect(spy).to.have.been.calledWith(data.failingTapData[i]);
    }
  }));

  it('should output actual value for failed assertions even it was undefined', sinon.test(function () {
    const spy = this.stub(console, 'log');

    emitter.emit('testEnd', data.actualUndefinedTest);

    expect(spy).to.have.been.calledWithMatch(/^ {2}actual {2}: undefined$/m);
  }));

  it('should output actual value for failed assertions even it was falsy', sinon.test(function () {
    const spy = this.stub(console, 'log');

    emitter.emit('testEnd', data.actualFalsyTest);

    expect(spy).to.have.been.calledWithMatch(/^ {2}actual {2}: 0$/m);
  }));

  it('should output expected value for failed assertions even it was undefined', sinon.test(function () {
    const spy = this.stub(console, 'log');

    emitter.emit('testEnd', data.expectedUndefinedTest);

    expect(spy).to.have.been.calledWithMatch(/^ {2}expected: undefined$/m);
  }));

  it('should output expected value for failed assertions even it was falsy', sinon.test(function () {
    const spy = this.stub(console, 'log');

    emitter.emit('testEnd', data.expectedFalsyTest);

    expect(spy).to.have.been.calledWithMatch(/^ {2}expected: 0$/m);
  }));

  it('should output the total number of tests', sinon.test(function () {
    const spy = this.stub(console, 'log');
    const summary = '1..6';
    const passCount = '# pass 3';
    const skipCount = chalk.yellow('# skip 1');
    const todoCount = chalk.cyan('# todo 0');
    const failCount = chalk.red('# fail 2');

    emitter.emit('runEnd', {
      testCounts: {
        total: 6,
        passed: 3,
        failed: 2,
        skipped: 1,
        todo: 0
      }
    });

    expect(spy).to.have.been.calledWith(summary);
    expect(spy).to.have.been.calledWith(passCount);
    expect(spy).to.have.been.calledWith(skipCount);
    expect(spy).to.have.been.calledWith(todoCount);
    expect(spy).to.have.been.calledWith(failCount);
  }));
});
