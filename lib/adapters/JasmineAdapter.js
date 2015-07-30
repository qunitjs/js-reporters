import EventEmitter from "../eventemitter";
import {Test, Suite} from "../data";

export default class JasmineAdapter extends EventEmitter {
    constructor(jasmine) {
        super();
        jasmine.addReporter({
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
    }


    onSpecStarted() {
        this.startTime = new Date();
    }

    onSpecDone(details) {
        var runtime = new Date() - this.startTime;
        var testName = details.description;
        var suiteName = details.fullName;
        var errors = details.failedExpectations;
        var skipped, status;
        if (details.status === "pending") {
            skipped = true;
            status = "skipped";
        } else {
            skipped = false;
            status = details.status;
        }

        if (suiteName.lastIndexOf(testName) === suiteName.length - testName.length) {
            suiteName = suiteName.substr(0, suiteName.length - testName.length - 1);
        }
        var test = new Test(
            testName,
            suiteName,
            status,
            runtime,
            errors,
            skipped
        );
        this.emit("testEnd", test);
        this.tests[this.tests.length - 1].push(test);
    }

    onSuiteStarted() {
        this.tests.push([]);
        this.suites.push([]);
    }

    onSuiteDone(details) {
        if (details.failedExpectations.length > 0) {
            this.tests[this.tests.length - 1].push(new Test("afterAll", "failed", 0));
        }
        var suite = new Suite(details.description, this.suites.pop(), this.tests.pop());
        this.emit("suiteEnd", suite);
        this.suites[this.suites.length - 1].push(suite);
    }

    onJasmineDone() {
        var globalSuite = new Suite("", this.suites.pop(), this.tests.pop());
        this.emit("runEnd", globalSuite);
    }
}
