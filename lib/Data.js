export class Test {
    constructor(testName, suiteName, status, runtime, errors, skipped) {
        this.testName = testName;
        this.suiteName = suiteName;
        this.status = status;
        this.runtime = runtime;
        this.errors = errors;
        this.skipped = skipped;
    }
}

export class Suite {
    /**
     *
     * @param name
     * @param childSuites
     * @param tests: array containing tests belonging to the suite but not to a child suite
     */
    constructor(name, childSuites, tests) {
        this.name = name;
        this.childSuites = childSuites;
        this.tests = tests;
    }

    getAllTests() {
        var childSuiteTests = this.childSuites
            .map((suite) => suite.getAllTests())
            .reduce((allTests, a) => allTests.concat(a), []);

        return this.tests.concat(childSuiteTests);
    }

    getTotal() {
        var summary = {
            passed: 0,
            failed: 0,
            skipped: 0,
            runtime: 0
        };

        var allTests = this.getAllTests();
        allTests.forEach(function (test) {
            if (test.status === "passed") {
                summary.passed++;
            } else if (test.status === "skipped") {
                summary.skipped++;
            } else {
                summary.failed++;
            }
            summary.runtime += test.runtime;

        });

        if (summary.failed > 0) {
            summary.status = "failed";
        } else if (summary.passed > 0) {
            summary.status = "passed";
        } else {
            summary.status = "skipped";
        }

        return summary;
    }
}

//TODO: good idea?
//Mocha just passes the exception thrown by the assertion library
/*
 export class Error {
 constructor(name, message, stack, expected, actual){
 this.name = name;
 this.message = message;
 this.stack = stack;
 this.expected = expected;
 this.actual = actual;
 }
 }
 /**/
