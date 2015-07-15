export default class TapReporter {
    constructor(runner) {
        this.runner = runner;
        this.count = 0;

        runner.on("testEnd", this.onTestEnd.bind(this));
        runner.on("runEnd", this.onRunEnd.bind(this));
    }

    static init(runner){
        return new TapReporter(runner);
    }

    onTestEnd(test) {
        this.count++;
        if (test.status === "failed") {
            console.log("not ok " + this.count + " " + test.testName);
        }
        else {
            console.log("ok " + this.count + " " + test.testName);
        }
    }

    onRunEnd() {
        console.log("1.." + this.count);
    }
}
