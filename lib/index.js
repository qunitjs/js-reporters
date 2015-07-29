import QUnitAdapter from "./adapters/QUnitAdapter.js";

import JasmineAdapter from "./adapters/JasmineAdapter.js";
import TapReporter from "./reporters/TapReporter.js";
import ConsoleReporter from "./reporters/ConsoleReporter.js";
import TestReporter from "./reporters/TestReporter.js";
import {qunit} from "./reporters/TestReporter.js";
import {jasmine} from "./reporters/TestReporter.js";

export default {
    QUnitAdapter: QUnitAdapter,
    JasmineAdapter: JasmineAdapter,
    TapReporter: TapReporter,
    ConsoleReporter: ConsoleReporter,
    TestReporter: TestReporter,
    qunit: qunit,
    jasmine: jasmine
};
