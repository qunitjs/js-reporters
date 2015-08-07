// TODO: finish grouping once suiteStart is implemented
var hasGrouping = "group" in console && "groupEnd" in console;

export default class ConsoleReporter {
    constructor(runner) {
        runner.on("runStart", this.onRunStart);
        runner.on("suiteStart", this.onSuiteStart);
        runner.on("testEnd", this.onTestEnd);
        runner.on("suiteEnd", this.onSuiteEnd);
        runner.on("runEnd", this.onRunEnd);
    }

    static init(runner) {
        return new ConsoleReporter(runner);
    }

    onRunStart(suite){
        console.log("runStart", suite)
    }

    onSuiteStart(suite) {
        if (hasGrouping) {
            console.group(suite.name);
        }
    }

    onTestEnd(test) {
        console.log("testEnd", test);
    }

    onSuiteEnd(suite) {
        console.log("suiteEnd", suite);
        if (hasGrouping) {
            console.groupEnd();
        }
    }

    onRunEnd(globalSuite) {
        console.log("runEnd", globalSuite);
    }
}

