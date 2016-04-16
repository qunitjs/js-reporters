var EventEmitter = require('events').EventEmitter;
import {Test, Suite} from "../Data.js";

export default class QUnitAdapter extends EventEmitter {
    constructor(QUnit) {
        super();
        this.QUnit = QUnit;
        QUnit.begin(this.onBegin.bind(this));
        QUnit.moduleStart(this.onModuleStart.bind(this));
        QUnit.testStart(this.onTestStart.bind(this));
        QUnit.log(this.onLog.bind(this));
        QUnit.testDone(this.onTestDone.bind(this));
        QUnit.moduleDone(this.onModuleDone.bind(this));
        QUnit.done(this.onDone.bind(this));

        this.idDataMap = {};
    }

    convertModule(qunitModule) {
        var suiteName = qunitModule.name;
        var tests = [];
        for (let qunitTest of qunitModule.tests) {
            let test = new Test(qunitTest.name, suiteName);
            tests.push(test);
            this.idDataMap[qunitTest.testId] = test;
        }

        var suite = new Suite(suiteName, [], tests);
        this.idDataMap[qunitModule.name] = suite;
        return suite;
    }

    onBegin() {
        var suites = [];

        // Access QUnit internals to build liste of modules, working around missing event data
        for (let suite of this.QUnit.config.modules) {
            suites.push(this.convertModule(suite));
        }

        this.idDataMap.globalSuite = new Suite(undefined, suites, []);
        this.emit("runStart", this.idDataMap.globalSuite);
    }

    onModuleStart(details) {
        this.emit("suiteStart", this.idDataMap[details.name]);
    }

    onTestStart(details) {
        this.errors = [];
        this.emit("testStart", this.idDataMap[details.testId]);
    }

    onLog(details) {
        if (!details.result) {
            this.errors.push(details);
        }
    }

    onTestDone(details) {
        var test = this.idDataMap[details.testId];

        if (details.failed !== 0) {
            test.status = "failed";
        } else if (details.skipped === true) {
            test.status = "skipped";
        } else {
            test.status = "passed";
        }

        test.runtime = details.runtime;
        test.errors = this.errors;

        this.emit("testEnd", test);
    }


    onModuleDone(details) {
        this.emit("suiteEnd", this.idDataMap[details.name]);
    }

    onDone() {
        this.emit("runEnd", this.idDataMap.globalSuite);
    }
}
