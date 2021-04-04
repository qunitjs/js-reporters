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
    sauceLabs: {
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      region: process.env.SAUCE_REGION || 'us'
    },
    customLaunchers: {
      firefox45: {
        base: 'SauceLabs',
        browserName: 'firefox',
        version: '45.0'
      },
      ie9: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '9'
      },
      ie10: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '10'
      },
      ie11: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '11'
      },
      safari9: {
        base: 'SauceLabs',
        browserName: 'safari',
        version: '9'
      },
      safari10: {
        base: 'SauceLabs',
        browserName: 'safari',
        version: '10'
      },
      safari: {
        base: 'SauceLabs',
        browserName: 'safari'
      },
      edge15: {
        // Edge 40 (EdgeHTML 15)
        base: 'SauceLabs',
        browserName: 'MicrosoftEdge',
        version: '15.15063'
      },
      edge: {
        // Edge 80+ (Chromium)
        base: 'SauceLabs',
        browserName: 'MicrosoftEdge'
      },
      chrome58: {
        base: 'SauceLabs',
        browserName: 'chrome',
        version: '58.0'
      }
    },
    concurrency: 4,
    browsers: [
      'firefox45',
      'ie9',
      'ie10',
      'ie11',
      'safari9',
      'safari10',
      'safari',
      'edge15',
      'edge',
      'chrome58'
    ],
    logLevel: 'WARN',
    singleRun: true,
    autoWatch: false
  });
};
