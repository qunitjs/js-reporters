/* global QUnit, mocha, jasmine */

import QUnitAdapter from './adapters/QUnitAdapter.js'
import MochaAdapter from './adapters/MochaAdapter.js'
import JasmineAdapter from './adapters/JasmineAdapter.js'

export function autoRegister () {
  var runner

  if (QUnit) {
    runner = new QUnitAdapter(QUnit)
  } else if (mocha) {
    runner = new MochaAdapter(mocha)
  } else if (jasmine) {
    runner = new JasmineAdapter(jasmine.getEnv())
  } else {
    throw new Error('JsReporters: No testing framework was found')
  }

  return runner
}
