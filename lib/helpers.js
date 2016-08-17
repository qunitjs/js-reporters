/* global QUnit, mocha, jasmine */

import QUnitAdapter from './adapters/QUnitAdapter.js'
import MochaAdapter from './adapters/MochaAdapter.js'
import JasmineAdapter from './adapters/JasmineAdapter.js'

/**
 * Auto registers the adapter for the respective testing framework and
 * returns the runner for event listening.
 */
export function autoRegister () {
  var runner

  if (QUnit) {
    runner = new QUnitAdapter(QUnit)
  } else if (mocha) {
    runner = new MochaAdapter(mocha)
  } else if (jasmine) {
    runner = new JasmineAdapter(jasmine.getEnv())
  } else {
    throw new Error(`JsReporters: No Qunit, Mocha or Jasmine
      framework was found`)
  }

  return runner
}
