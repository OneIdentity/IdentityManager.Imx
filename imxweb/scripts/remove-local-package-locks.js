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
 * Copyright 2026 One Identity LLC.
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
// The .js version of this file is generated from the .ts file. Please only change the .ts file and regen via tsc.
// Script to handle removing local packages installed from the lock file
// Should be run from the root imxweb dir.
// Use: node remove-local-package-locks.js <path//to//package-lock.json>
// Optional: <path//to//package-lock.json> must correspond to the physical path ../imxweb/package-lock.json
var fs = require("fs");
var path = require("path");
var process = require("process");
// Look for a positional argument to point where the package-lock is; defaults to the current dir
var lockFile = process.argv.length > 2 ? process.argv[2] : './package-lock.json';
var lockContent;
if (fs.existsSync(lockFile)) {
    lockContent = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
}
else {
    throw "The file ".concat(path.resolve(lockFile), " doesn't exist.");
}
// Regex to match scoped @imx-modules/* and @elemental-ui/*
var scopedPackageRegex = /@(imx-modules|elemental-ui)\/.+$/;
var anyChanges = false;
for (var _i = 0, _a = Object.keys(__assign(__assign({}, lockContent.dependencies), lockContent.packages)); _i < _a.length; _i++) {
    var name_1 = _a[_i];
    if (!scopedPackageRegex.test(name_1))
        continue;
    if ((lockContent === null || lockContent === void 0 ? void 0 : lockContent.dependencies) && lockContent.dependencies[name_1]) {
        delete lockContent.dependencies[name_1];
        anyChanges = true;
    }
    if ((lockContent === null || lockContent === void 0 ? void 0 : lockContent.packages) && lockContent.packages[name_1]) {
        delete lockContent.packages[name_1];
        anyChanges = true;
    }
}
if (anyChanges) {
    overWriteLockFile(lockFile);
}
else {
    console.log("No local packages to remove");
}
removeReactAsset();
function overWriteLockFile(lockFile) {
    // write JSON with the same indentation as npm; trimming the last line feed
    var toWrite = JSON.stringify(lockContent, null, 2) + '\n';
    try {
        fs.writeFileSync(lockFile, toWrite, {
            encoding: 'utf8',
        });
    }
    catch (err) {
        throw err;
    }
    finally {
        console.log("Removed local packages from package-lock");
    }
}
function removeReactAsset() {
    // Remove this function when we have migrated to nx/angular 22.3.3 or later
    // This is a temporary workaround for having a security issue with react-server-x
    console.log("Removing react-server-dom-webpack to mitigate security issue");
    var base = process.argv.length > 2 ? process.argv[2] : './';
    var reactServerPath = path.join(base, 'node_modules', '@modern-js', 'utils', 'dist', 'compiled', 'react-server-dom-webpack');
    if (fs.existsSync(reactServerPath))
        fs.rmSync(reactServerPath, { recursive: true, force: true });
}
