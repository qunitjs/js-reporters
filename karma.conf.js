module.exports = function (config) {
  const { nodeResolve } = require('@rollup/plugin-node-resolve');
  const commonjs = require('@rollup/plugin-commonjs');

  config.set({
    files: [
      'node_modules/sinon/pkg/sinon.js',
      'test/unit/tap-reporter.js',
      'test/unit/helpers.js'
    ],
    preprocessors: {
      'test/unit/**.js': ['rollup']
    },
    rollupPreprocessor: {
      external: ['sinon'],
      output: {
        globals: {
          sinon: 'sinon'
        },
        format: 'iife',
        name: 'JsReporters_Test',
        sourcemap: true
      },
      plugins: [
        // For 'events' and 'kleur'
        nodeResolve({
          preferBuiltins: false
        }),
        commonjs({
          // This makes require() work like in Node.js,
          // instead of wrapped in a {default:…} object.
          requireReturnsDefault: 'auto'
        })
      ]
    },
    frameworks: ['qunit'],
    browsers: ['FirefoxHeadless', 'ChromeHeadless'],
    singleRun: true,
    autoWatch: false
  });
};
