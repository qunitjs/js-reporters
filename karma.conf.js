module.exports = function (config) {
  const { babel } = require('@rollup/plugin-babel');
  const commonjs = require('@rollup/plugin-commonjs');
  const { nodeResolve } = require('@rollup/plugin-node-resolve');

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
      // See rollup.config.js
      plugins: [
        nodeResolve({
          preferBuiltins: false
        }),
        commonjs({
          requireReturnsDefault: 'preferred'
        }),
        babel({
          babelHelpers: 'bundled',
          babelrc: false,
          presets: [
            ['@babel/preset-env', {
              targets: {
                ie: 9
              }
            }]
          ]
        })
      ]
    },
    frameworks: ['qunit'],
    browsers: ['FirefoxHeadless'],
    singleRun: true,
    autoWatch: false
  });
};
