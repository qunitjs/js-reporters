import QUnitAdapter from './lib/adapters/QUnitAdapter.js'
import JasmineAdapter from './lib/adapters/JasmineAdapter.js'
import MochaAdapter from './lib/adapters/MochaAdapter.js'
import TapReporter from './lib/reporters/TapReporter.js'
import ConsoleReporter from './lib/reporters/ConsoleReporter.js'
import {Assertion, Test, Suite} from './lib/Data.js'

export default {
  QUnitAdapter,
  JasmineAdapter,
  MochaAdapter,
  TapReporter,
  ConsoleReporter,
  Assertion,
  Test,
  Suite
}
