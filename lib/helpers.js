/* global QUnit, mocha, jasmine */

import QUnitAdapter from './adapters/QUnitAdapter.js'
import MochaAdapter from './adapters/MochaAdapter.js'
import JasmineAdapter from './adapters/JasmineAdapter.js'

/**
 * Auto registers the adapter for the respective testing framework and
 * returns the runner for event listening.
 */
function autoRegister () {
  var runner

  if (QUnit) {
    runner = new QUnitAdapter(QUnit)
  } else if (mocha) {
    runner = new MochaAdapter(mocha)
  } else if (jasmine) {
    runner = new JasmineAdapter(jasmine.getEnv())
  } else {
    throw new Error('Failed to register js-reporters adapater. Supported ' +
      'frameworks are: QUnit, Mocha, Jasmine')
  }

  return runner
}

export default {
  autoRegister
}
