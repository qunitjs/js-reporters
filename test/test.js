/* eslint camelcase:0 */
var Jasmine = require("jasmine");
QUnit = require("qunitjs");
var JsReporters = require("../dist/js-reporters.js");
var referenceData = require("./referenceData.js");


var jasmine = new Jasmine();
jasmine.loadConfig({
    spec_dir: "test/jasmine",
    spec_files: [
        "tests.js"
    ]
});

var jasmineRunner = new JsReporters.JasmineAdapter(jasmine.env);
jasmine.addReporter({}); // Suppress the default reporter
var jasmineTestReporter = new JsReporters.TestReporter(jasmineRunner, referenceData.Jasmine);

jasmine.execute();
if (!jasmineTestReporter.ok) {
    throw new Error("Tests for JasmineAdapter failed!");
}

QUnit.config.autorun = false;

require("./qunit/tests.js");
var qunitRunner = new JsReporters.QUnitAdapter();
var qunitTestReporter = new JsReporters.TestReporter(qunitRunner, referenceData.QUnit);

QUnit.load();