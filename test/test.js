/* eslint camelcase:0, no-process-exit:0 */
var Jasmine = require("jasmine");
var QUnit = require("qunitjs");
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

//TODO: Use a proper test framework?
var done = new Promise(function (resolve) {
    QUnit.done(function () {
        resolve();
    });
});

var qunitRunner = new JsReporters.QUnitAdapter(QUnit);
var qunitTestReporter = new JsReporters.TestReporter(qunitRunner, referenceData.QUnit);

QUnit.config.autorun = false;
QUnit.config.reorder = false;

require("./qunit/tests.js");

QUnit.load();

done.then(function () {
    // This is async, throwing an error doesn't change the exit code.
    process.exit(qunitTestReporter.ok ? 0 : 1);
});
