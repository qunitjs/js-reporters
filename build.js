var mkdirp = require("mkdirp");
var esperanto = require("esperanto");
var fs = require("fs");
var babel = require("babel");
var pkg = require("./package.json");

mkdirp.sync("dist");

esperanto.bundle({
    base: "lib",
    entry: "index.js"
}).then(function (bundle) {
    var umd = bundle.toUmd({
        name: "JsReporters"
    });

    var transformed = babel.transform(umd.code, {
        blacklist: [
            "useStrict"
        ]
    });
    var license = fs.readFileSync("lib/license-header.js", {encoding: "utf8"})
        .replace("@VERSION", pkg.version)
        .replace("@DATE", ( new Date() ).toISOString().replace(/:\d+\.\d+Z$/, "Z"));
    var content = license + "(function() {\n" + transformed.code + "\n})();";
    fs.writeFileSync("dist/js-reporters.js", content);
}).catch(console.error);
