const EventEmitter = require('events');
const QUnitAdapter = require('./lib/adapters/QUnitAdapter.js');
const JasmineAdapter = require('./lib/adapters/JasmineAdapter.js');
const MochaAdapter = require('./lib/adapters/MochaAdapter.js');
const TapReporter = require('./lib/reporters/TapReporter.js');
const ConsoleReporter = require('./lib/reporters/ConsoleReporter.js');
const SummaryReporter = require('./lib/reporters/SummaryReporter.js');
const {
  createTestStart
} = require('./lib/helpers.js');
const { autoRegister } = require('./lib/auto.js');

module.exports = {
  QUnitAdapter,
  JasmineAdapter,
  MochaAdapter,
  TapReporter,
  ConsoleReporter,
  SummaryReporter,
  EventEmitter,
  createTestStart,
  autoRegister
};
