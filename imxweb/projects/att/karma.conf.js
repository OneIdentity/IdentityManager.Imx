// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-ie-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-junit-reporter'),
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'results'),
      reports: ['html', 'text-summary', 'cobertura'],
      fixWebpackSourcePaths: true,
      'report-config': {
        html: {
          subdir: 'coverage-html'
        },
      },
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0
      },
    },
    junitReporter: {
      outputDir: require('path').join(__dirname, 'results'),
    },
    reporters: ['progress', 'coverage-istanbul', 'junit'],
    port: 9876,
    captureTimeout: 210000,
    browserDisconnectTolerance: 3,
    browserDisconnectTimeout : 210000,
    browserNoActivityTimeout : 210000,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
