"use strict";
/*
 * ONE IDENTITY LLC. PROPRIETARY INFORMATION
 *
 * This software is confidential.  One Identity, LLC. or one of its affiliates or
 * subsidiaries, has supplied this software to you under terms of a
 * license agreement, nondisclosure agreement or both.
 *
 * You may not copy, disclose, or use this software except in accordance with
 * those terms.
 *
 *
 * Copyright 2025 One Identity LLC.
 * ALL RIGHTS RESERVED.
 *
 * ONE IDENTITY LLC. MAKES NO REPRESENTATIONS OR
 * WARRANTIES ABOUT THE SUITABILITY OF THE SOFTWARE,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, OR
 * NON-INFRINGEMENT.  ONE IDENTITY LLC. SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING
 * THIS SOFTWARE OR ITS DERIVATIVES.
 *
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// The .js version of this file is generated from the .ts file. Please only change the .ts file and regen via tsc.
// Script to handle installing local packages living in imx-modules
// Should be run from the root imxweb dir.
// Use: node install-local-package.js <path//to//imx-modules> --skip-dialog
// --skip-dialog will auto overwrite feeds if imx-modules are present
// Optional: <path//to//imx-modules> must correspond to the physical path ../imxweb/imx-modules
var child_process = require("child_process");
var fs = require("fs");
var path = require("path");
var process = require("process");
var readline = require("readline");
// Look for a positional argument to point where the imx-modules are; defaults to imx-modules
var imxModuleDir = process.argv.length > 2 ? process.argv[2] : 'imx-modules';
var nodePackageDir = '@imx-modules';
var nodeElementalDir = '@elemental-ui';
var nodeModuleDir = 'node_modules';
var cliInterface = readline.createInterface({ input: process.stdin, output: process.stdout });
var question = function (str) { return new Promise(function (resolve) { return cliInterface.question(str, resolve); }); };
var steps = {
    start: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, steps.checkForModules()];
        });
    }); },
    checkForModules: function () { return __awaiter(void 0, void 0, void 0, function () {
        var answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!hasLocalPackages()) {
                        console.log('No imx-modules found, keeping default feeds.');
                        return [2 /*return*/, steps.end()];
                    }
                    // Check if we have auto answered yes, this is a PR build and hence want to use local packages, or if we are an external developer with no access to feeds
                    if (process.env.npm_config_skip_dialog || process.env.npm_config_buildid || !installedInternalPackages()) {
                        console.log('Env variable set to auto overwrite feeds or determined no feeds present and used local packages instead.');
                        return [2 /*return*/, steps.overwrite()];
                    }
                    return [4 /*yield*/, question("Found imx-modules here: ".concat(path.resolve(imxModuleDir), "\nDo you want to overwrite the feeds?\nExternal developers are recommended to answer y: (y/n)"))];
                case 1:
                    answer = _a.sent();
                    return [2 /*return*/, answer.toLowerCase() === 'y' ? steps.overwrite() : steps.keepDefault()];
            }
        });
    }); },
    overwrite: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            overwrite();
            return [2 /*return*/, steps.end()];
        });
    }); },
    keepDefault: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('Keeping default feeds.');
            return [2 /*return*/, steps.end()];
        });
    }); },
    end: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, cliInterface.close()];
    }); }); },
};
steps.start();
// Check if we have already gotten internal packages
function installedInternalPackages() {
    return fs.existsSync(path.join(nodeModuleDir, nodePackageDir)) && fs.existsSync(path.join(nodeModuleDir, nodeElementalDir));
}
// Check if there are local packages available
function hasLocalPackages() {
    return fs.existsSync(imxModuleDir) && fs.readdirSync(imxModuleDir).filter(function (file) { return file.endsWith('.tgz'); }).length > 0;
}
function overwrite() {
    console.log('Overwriting with...');
    var installArg = '';
    var filePath;
    fs.readdirSync(imxModuleDir)
        .filter(function (file) { return file.endsWith('.tgz'); })
        .forEach(function (file) {
        filePath = path.resolve(imxModuleDir, file);
        if (file.includes('imx-')) {
            var baseName = path.parse(file).name;
            installArg += [nodePackageDir, '/', baseName, '@', filePath, ' '].join('');
        }
        else if (file.includes('cadence-icon')) {
            installArg += ['@elemental-ui/cadence-icon@', filePath, ' '].join('');
        }
        else if (file.includes('core')) {
            installArg += ['@elemental-ui/core@', filePath, ' '].join('');
        }
        console.log(filePath);
    });
    console.log("\nRunning command npm i ".concat(installArg, " --save=false"));
    var child = child_process.spawnSync('npm', ['i', installArg, '--save=false'], {
        encoding: 'utf8',
        shell: true,
    });
    if (child.status === 0) {
        console.log('Overwrite Finished');
    }
    else {
        console.log('There was an error:');
        console.error(child.output);
        process.exit(1);
    }
}
