"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
const architect_1 = require("@angular-devkit/architect");
const node_module_1 = require("node:module");
const node_path_1 = __importDefault(require("node:path"));
/**
 * @experimental Direct usage of this function is considered experimental.
 */
async function* execute(options, context, transforms = {}) {
    const { execute } = await Promise.resolve().then(() => __importStar(require('./application_builder')));
    const karmaOptions = getBaseKarmaOptions(options, context);
    yield* execute(options, context, karmaOptions, transforms);
}
function getBaseKarmaOptions(options, context) {
    let singleRun;
    if (options.watch !== undefined) {
        singleRun = !options.watch;
    }
    // Determine project name from builder context target
    const projectName = context.target?.project;
    if (!projectName) {
        throw new Error(`The 'karma' builder requires a target to be specified.`);
    }
    const karmaOptions = options.karmaConfig
        ? {}
        : getBuiltInKarmaConfig(context.workspaceRoot, projectName);
    karmaOptions.singleRun = singleRun;
    // Workaround https://github.com/angular/angular-cli/issues/28271, by clearing context by default
    // for single run executions. Not clearing context for multi-run (watched) builds allows the
    // Jasmine Spec Runner to be visible in the browser after test execution.
    karmaOptions.client ??= {};
    karmaOptions.client.clearContext ??= singleRun ?? false; // `singleRun` defaults to `false` per Karma docs.
    // Convert browsers from a string to an array
    if (typeof options.browsers === 'string' && options.browsers) {
        karmaOptions.browsers = options.browsers.split(',');
    }
    else if (options.browsers === false) {
        karmaOptions.browsers = [];
    }
    if (options.reporters) {
        // Split along commas to make it more natural, and remove empty strings.
        const reporters = options.reporters
            .reduce((acc, curr) => acc.concat(curr.split(',')), [])
            .filter((x) => !!x);
        if (reporters.length > 0) {
            karmaOptions.reporters = reporters;
        }
    }
    return karmaOptions;
}
function getBuiltInKarmaConfig(workspaceRoot, projectName) {
    let coverageFolderName = projectName.charAt(0) === '@' ? projectName.slice(1) : projectName;
    coverageFolderName = coverageFolderName.toLowerCase();
    const workspaceRootRequire = (0, node_module_1.createRequire)(workspaceRoot + '/');
    // Any changes to the config here need to be synced to: packages/schematics/angular/config/files/karma.conf.js.template
    return {
        basePath: '',
        frameworks: ['jasmine'],
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-jasmine-html-reporter',
            'karma-coverage',
        ].map((p) => workspaceRootRequire(p)),
        jasmineHtmlReporter: {
            suppressAll: true, // removes the duplicated traces
        },
        coverageReporter: {
            dir: node_path_1.default.join(workspaceRoot, 'coverage', coverageFolderName),
            subdir: '.',
            reporters: [{ type: 'html' }, { type: 'text-summary' }],
        },
        reporters: ['progress', 'kjhtml'],
        browsers: ['Chrome'],
        customLaunchers: {
            // Chrome configured to run in a bazel sandbox.
            // Disable the use of the gpu and `/dev/shm` because it causes Chrome to
            // crash on some environments.
            // See:
            //   https://github.com/puppeteer/puppeteer/blob/v1.0.0/docs/troubleshooting.md#tips
            //   https://stackoverflow.com/questions/50642308/webdriverexception-unknown-error-devtoolsactiveport-file-doesnt-exist-while-t
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'],
            },
        },
        restartOnFileChange: true,
    };
}
const builder = (0, architect_1.createBuilder)(execute);
exports.default = builder;
