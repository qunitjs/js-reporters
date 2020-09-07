/* global QUnit, mocha, jasmine */

const QUnitAdapter = require('./adapters/QUnitAdapter.js');
const MochaAdapter = require('./adapters/MochaAdapter.js');
const JasmineAdapter = require('./adapters/JasmineAdapter.js');

/**
 * Auto registers the adapter for the respective testing framework and
 * returns the runner for event listening.
 */
function autoRegister () {
  let runner;

  if (QUnit) {
    runner = new QUnitAdapter(QUnit);
  } else if (mocha) {
    runner = new MochaAdapter(mocha);
  } else if (jasmine) {
    runner = new JasmineAdapter(jasmine);
  } else {
    throw new Error('Failed to register js-reporters adapter. Supported ' +
      'frameworks are: QUnit, Mocha, Jasmine');
  }

  return runner;
}

module.exports = {
  autoRegister
};
