import EventEmitter from "../EventEmitter.js";
import {Test, Suite} from "../Data.js";

export default class JasmineAdapter extends EventEmitter {
    constructor(jasmine) {
        super();
        this.jasmine = jasmine;
        jasmine.addReporter({
            jasmineStarted: this.onJasmineStarted.bind(this),
            specDone: this.onSpecDone.bind(this),
            specStarted: this.onSpecStarted.bind(this),
            suiteStarted: this.onSuiteStarted.bind(this),
            suiteDone: this.onSuiteDone.bind(this),
            jasmineDone: this.onJasmineDone.bind(this)
        });
        // a stack of test arrays. The top element on the stack is the currently active suite
        this.tests = [[]];
        // a stack of suite arrays
        this.suites = [[]];

        this.idObjectMap = {};
    }

    convertSuite(jasmineSuite) {
        var name = jasmineSuite.description;
        var childSuites = [];
        var tests = [];
        for (var i = 0; i < jasmineSuite.children.length; i++) {
            if (jasmineSuite.children[i].id.startsWith("suite")) {
                childSuites.push(this.convertSuite(jasmineSuite.children[i]));
            } else if (jasmineSuite.children[i].id.startsWith("spec")) {
                tests.push(this.convertSpec(jasmineSuite.children[i]));
            }
        }
        var suite = new Suite(name, childSuites, tests);

        this.idObjectMap[jasmineSuite.id] = suite;

        return suite;
    }


    convertSpec(jasmineSpec) {
        var testName = jasmineSpec.description;
        var suiteName = jasmineSpec.result.fullName;
        var status;
        var runtime = undefined;
        var errors = [];

        if (jasmineSpec.markedPending) {
            status = "skipped";
        } else {
            status = undefined;
        }
        if (suiteName.lastIndexOf(testName) === suiteName.length - testName.length) {
            suiteName = suiteName.substr(0, suiteName.length - testName.length - 1);
        }

        var test = new Test(
            testName,
            suiteName,
            status,
            runtime,
            errors);


        return test;
    }


    onJasmineStarted() {
        var startSuite = this.convertSuite(this.jasmine.topSuite());
        startSuite.name = "";
        this.idObjectMap["globalSuite"] = startSuite;

        this.emit("runStart", startSuite);
    }


    onSpecStarted() {
        this.startTime = new Date();
    }

    onSpecDone(details) {
        var runtime = new Date() - this.startTime;
        var testName = details.description;
        var suiteName = details.fullName;
        var errors = details.failedExpectations;
        var status;
        if (details.status === "pending") {
            status = "skipped";
        } else {
            status = details.status;
        }

        // Jasmine only provides a concatenated suiteName + testName string.
        // Remove the testName from the string.
        if (suiteName.lastIndexOf(testName) === suiteName.length - testName.length) {
            suiteName = suiteName.substr(0, suiteName.length - testName.length - 1);
        }
        var test = new Test(
            testName,
            suiteName,
            status,
            runtime,
            errors
        );
        this.emit("testEnd", test);
        this.tests[this.tests.length - 1].push(test);
    }

    onSuiteStarted(details) {
        this.tests.push([]);
        this.suites.push([]);
        this.emit("suiteStart", this.idObjectMap[details.id]);
    }

    onSuiteDone(details) {

        this.emit("suiteEnd", this.idObjectMap[details.id]);

        /*
         FIXME: Jasmine Suite may have failedExpectations caused by a failure in afterAll.
         Changing the number of tests during runtime seems like a bad idea

         if (details.failedExpectations.length > 0) {
         this.tests[this.tests.length - 1].push(new Test("afterAll", "failed", 0));
         }
         */
    }

    onJasmineDone(details) {
        this.emit("runEnd", this.idObjectMap["globalSuite"]);
    }
}
