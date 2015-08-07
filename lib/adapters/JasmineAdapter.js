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

        // Map internal jasmine ids to standardized test/suite objects.
        this.idObjectMap = {};
    }

    /**
     * Recursively converts a jasmine suite into a standardized suite.
     */
    convertSuite(jasmineSuite) {
        var name = jasmineSuite.description;
        var childSuites = [];
        var tests = [];
        for (let child of jasmineSuite.children) {
            // a child can be either a suite or a spec. We use the id to distinguish between the two.
            if (child.id.indexOf("suite") === 0) {
                childSuites.push(this.convertSuite(child));
            } else if (child.id.indexOf("spec") === 0) {
                tests.push(this.convertSpec(child));
            }
        }
        var suite = new Suite(name, childSuites, tests);

        this.idObjectMap[jasmineSuite.id] = suite;

        return suite;
    }

    /**
     * Converts a jasmine spec into a standardized test.
     */
    convertSpec(jasmineSpec) {
        var testName = jasmineSpec.description;
        var suiteName = jasmineSpec.result.fullName;
        var status;

        if (jasmineSpec.markedPending) {
            status = "skipped";
        } else {
            status = undefined;
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
            undefined,
            undefined
        );

        this.idObjectMap[jasmineSpec.id] = test;

        return test;
    }


    onJasmineStarted() {
        var startSuite = this.convertSuite(this.jasmine.topSuite());
        startSuite.name = "";
        this.idObjectMap.globalSuite = startSuite;

        this.emit("runStart", startSuite);
    }


    onSpecStarted(details) {
        this.startTime = new Date();
        this.emit("testStart", this.idObjectMap[details.id]);
    }

    onSpecDone(details) {
        var test = this.idObjectMap[details.id];
        test.runtime = new Date() - this.startTime;
        test.errors = details.failedExpectations;
        if (details.status === "pending") {
            test.status = "skipped";
        } else {
            test.status = details.status;
        }

        this.emit("testEnd", test);
    }

    onSuiteStarted(details) {
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

    onJasmineDone() {
        this.emit("runEnd", this.idObjectMap.globalSuite);
    }
}
