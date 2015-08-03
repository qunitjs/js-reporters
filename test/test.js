var Jasmine = require('jasmine');
var JsReporters = require('../dist/js-reporters.js');
var referenceData = require('./referenceData.js');

var jasmine = new Jasmine();
jasmine.loadConfig({
    spec_dir: "test/jasmine",
    spec_files: [
        "tests.js"
    ]
});

var runner =  new JsReporters.JasmineAdapter(jasmine);
var testReporter = new JsReporters.TestReporter(runner, referenceData.Jasmine);

jasmine.execute();
if (!testReporter.ok){
    process.exit(1);
}

