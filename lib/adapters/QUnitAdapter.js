import EventEmitter from "../EventEmitter.js";
import {Test, Suite} from "../Data.js";

/*global QUnit*/
export default class QUnitAdapter extends EventEmitter {
    constructor() {
        super();
        QUnit.config.reorder = false;
        QUnit.begin(this.onBegin.bind(this));
        QUnit.moduleStart(this.onModuleStart.bind(this));
        QUnit.testStart(this.onTestStart.bind(this));
        QUnit.log(this.onLog.bind(this));
        QUnit.testDone(this.onTestDone.bind(this));
        QUnit.moduleDone(this.onModuleDone.bind(this));
        QUnit.done(this.onDone.bind(this));

        this.idObjectMap = {};
    }

    convertModule(qunitModule) {
        var name = qunitModule.name;
        var childSuites = [];
        var tests = [];
        for (let test of qunitModule.tests) {
            var jsTest = new Test(test.name, qunitModule.name, undefined, undefined, undefined);
            tests.push(jsTest);
            this.idObjectMap[test.testId] = jsTest;
        }

        var suite = new Suite(name, childSuites, tests);

        this.idObjectMap[qunitModule.name] = suite;

        return suite;
    }

    onBegin() {
        var suites = [];
        for (let suite of QUnit.config.modules) {
            suites.push(this.convertModule(suite));
        }

        this.idObjectMap.globalSuite = new Suite("", suites, []);
        this.emit("runStart", this.idObjectMap.globalSuite);
    }

    onModuleStart(details) {
        this.emit("suiteStart", this.idObjectMap[details.name]);
    }

    onTestStart(details) {
        this.errors = [];
        this.emit("testStart", this.idObjectMap[details.testId]);
    }

    onLog(details) {
        if (!details.result) {
            this.errors.push(details);
        }
    }

    onTestDone(details) {
        var test = this.idObjectMap[details.testId];

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
        this.emit("suiteEnd", this.idObjectMap[details.name]);
    }

    onDone() {
        this.emit("runEnd", this.idObjectMap.globalSuite);
    }
}
