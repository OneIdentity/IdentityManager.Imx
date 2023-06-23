**One Identity open source projects are supported through [One Identity GitHub issues](https://github.com/OneIdentity/IdentityManager.Imx/issues) and the [One Identity Community](https://www.oneidentity.com/community/). This includes all scripts, plugins, SDKs, modules, code snippets or other solutions. For assistance with any One Identity GitHub project, please raise a new Issue on the [One Identity GitHub project](https://github.com/OneIdentity/IdentityManager.Imx/issues) page. You may also visit the [One Identity Community](https://www.oneidentity.com/community/) to ask questions.  Requests for assistance made through official One Identity Support will be referred back to GitHub and the One Identity Community forums where those requests can benefit all users.**

# Identity Manager HTML5 applications

## Change log

### June 23, 2023

This update addresses the following security issues.

* 418453 The packages `karma` and `socket.io` have been updated to address security issue CVE-2023-32695.

The `v91` branch has been updated with fixes for the following issues.

* 416865 use string reduce to build comma-separated list of properties in `imxweb/projects/qer/src/lib/org-chart`
* 410170 fixed accessibility of links on the dashboard
* 416107 Data Explorer: error when showing department memberships (`Cannot read properties of undefined (reading 'markAsPristine')`)
* 35861 Avoid unnecessary reload of attestation cases after approving them
* 417211 New request: The dialog for request properties is cancelling the request when clicking by mistake outside the window
* Fixes to `projects/rps/src/lib/reports/edit-report-sidesheet/edit-report-sidesheet.component.html`:
  * Disabled save button, if the sidesheet is read only
  * Removed placeholder string
* 412957 Error when editing subscribable reports
* 417337 Fix ordering of optional service items
* 416793 Fixed validation of delegation requests

### April 24, 2023

- The branch `v91` is now up to date with the 9.1.1 release of Identity Manager.
- This update addresses the following security issues.
  - 410789 Updated Webpack to address security issue CVE-2023-28154.
  - 403744 Updated `ua-parser-js` to address security issue CVE-2022-25927.
- The repository has been updated with fixes for the following issues.
  - 407356 The `deleteDestPath` option is now set for Angular projects. This avoids having to restart `ng serve` when re-compiling base libraries. See [this Angular issue](https://github.com/angular/angular-cli/issues/24791) for more details.
  - 319131 Fixed a bug when adding a service item to a request template.
  - 407514 Fixed the password profile tab selection on the profile page.
  - 403575 Fixed a SCSS bug.
  - 406544, 406542 Fixed app titles.
  - 406002 Search was not working correctly for application entitlements.
  - 358311, 405872 Fixed a bug when copying an attestation policy.
  - 322939 Fixed a bug that caused the page to load infinitely when loading password profile questions.
  - 395047 Fixed a bug on the password profile page.
  - 36635 / 403650 Configuration of `EditableFields` was not being used for accounts in the Data Explorer.
  - 394255 The API Documentation ("Swagger") page now submits XSRF protection tokens.
  - 405669 History data was not being loaded from all objects.
  - 278243 Add tags required to host the Password Reset Portal in the Password Manager Secure Password Extension.
  - 367262 Fixed view bugs on the rule violations page.
  - 305110 Fixed a bug when creating dynamic groups.
  - 399901 Fixed a bug in the grouped view of attestation cases.
  - 386166 Fixed the links on the Packages view of the Administration Portal.
  - 366940 Fixed a bug when running the application without the `RISKINDEX` configuration parameter.
  - 367251 Fixed a bug when approving policy violations.
  - 36325 Fixed a bug that was causing the indirect reports view to only show direct reports.
  - 389005 Fixed the view of attestation cases in the Data Explorer.
  - 223697 Fixed an application name change bug
  - 290031 Fixed a bug that was causing the chief approval team switch to be displayed after logging out and logging back in with a different user.
  - 308537 Fixed a bug in the view to split a role.
  - 393025 Fixed a bug in the [fk-hierarchical-dialog](./imxweb/projects/qbm/src/lib/fk-hierarchical-dialog/fk-hierarchical-dialog.component.ts) component.
  - 393701 Fixed a bug when selecting an image for an application entitlement for the second time.
  - 291061 The explanation for service category image inheritance was also shown when the inheritance itself is disabled.
  - 310269 Fixed a bug when creating a request template with a name longer than 64 characters.
  - 399839 The date in the history view was displayed in an incorrect format.
  - 307558 The publication date of an application was displayed in an incorrect format.
  - 393864 Fixed a bug in the grouped view of attestation runs.
  - 388613 Fixed a missing scrollbar in the Pending Provisioning Processes view.
  - 393524 The code to remove the local packages from `package-lock.json` has been moved to [remove-local-package-locks.js](imxweb/remove-local-package-locks.js).
  - 324122 The unneccessary files `imx-project.json` and `placeholder.spec.ts` have been deleted.
  - 387104 Fixed a line break in the "Cancel request" drop-down menu item.
  - 331942 The rule violation details view now shows more information.
  - 332087 Fixed OAuth login to the Server Administration app.

### March 27, 2023

- Added some [code samples](sdk_samples/README.md) with explanations.

### December 21, 2022

- The repository has been updated with fixes for the following issues.
  - 323931 Role details sidesheet has stale data problems.
  - 330766/36011 Members of the identity administrator roles cannot edit some identity data.
  - 384912 Login errors were not being handled correctly.
  - 332393/36057 Publishing of an application entitlement did not work correctly.
  - 388710/36356 The detail sidesheet for a request template did not open corectly.
  - 314291 The button to add a configuration setting was visible even when no setting could be added.
  - 387119 Some tiles on the dashboard were overlapping on smaller resolutions.
  - 386868/36143 Candidates for parameter values were not correctly reloaded.

### November 8, 2022

- The repository has been updated with fixes for the following issues.
  - Dependency updates for CVE-2022-39353
  - 35988: Report subscriptions fail if PDF is not a valid format for the report.
  - Other minor stability and bug fixes

### September 27, 2022

- The repository has been updated with the source code for the Identity Manager 9.1 release in the `v91` branch.
- Added clarification on the [required node.js version](#installing-nodejs).

### July 29, 2022

- The repository has been updated with the source code for the Identity Manager 9.0 release in the `v90` branch.
- The build now supports case-sensitive file systems (namely Linux) in the `v90` branch.

### June 7, 2022

- Added clarification on the [branches](#branches-and-update-policy).
- The `v82` branch has been updated with the contents of the 8.2.1 rollup package.
- The build definition has been split into separate steps for each package.

### May 2, 2022

The repository has been updated with the code changes for the Identity Manager 8.2.1 release.

## About the repository

This repository contains the source code for the HTML5 applications contained in Identity Manager.

It is a monorepo containing the Angular [workspace](https://angular.io/guide/workspace-config), which consists of apps and [libraries](https://angular.io/guide/libraries).

By forking this repository, you may create customized versions of the projects and add them to your Identity Manager deployment.

## Workspace overview

Each Angular library and app belongs to a folder in the `projects` directory. The workspace is defined in the `angular.json` file.

### Angular libraries

|Name|Type|Dependencies inside the workspace|
|-|-|-|
|`qbm`|Angular library|none|
|`qer`|Angular library|`qbm`|
|`tsb`|Angular plugin library|`qbm`, `qer`|
|`att`|Angular plugin library|`qbm`, `qer`|
|`rms`|Angular plugin library|`qbm`, `qer`|
|`rps`|Angular plugin library|`qbm`, `qer`|
|`aad`|Angular plugin library|`qbm`, `qer`, `tsb`|
|`aob`|Angular plugin library|`qbm`, `qer`|
|`uci`|Angular plugin library|`qbm`, `qer`|
|`cpl`|Angular plugin library|`qbm`, `qer`|
|`hds`|Angular plugin library|`qbm`, `qer`|
|`dpr`|Angular plugin library|`qbm`|
|`o3t`|Angular plugin library|`qbm`, `qer`, `tsb`|
|`olg`|Angular plugin library|`qbm`, `qer`|
|`pol`|Angular plugin library|`qbm`, `qer`|

Each Angular library belongs to the Identity Manager module of the same name.

A (non-plugin) library acts like a regular compile-time dependency. A _plugin_ library is loaded dynamically at runtime, as determined by the plugins' `imx-plugin-config.json` files.

For more information about each project, see the `readme.md` files in each project's folder.

### Angular apps

|Name|Description|Project type|Static dependencies|
|-|-|-|-|
|`qbm-app-landingpage`|API Server landing page and Server Administration|Angular app|`qbm`|
|`qer-app-portal`|Portal|Angular app|`qbm`, `qer`|
|`qer-app-operationssupport`|Operations Support Portal|Angular app|`qbm`, `qer`|
|`qer-app-pwdportal`|Password Reset Portal|Angular app|`qbm`, `qer`|

## Installing node.js

Verify that you have installed the correct `node.js` version for your branch. The version used by the CI build is defined in the [`.github/workflows/npm-build.yml`](.github/workflows/npm-build.yml) file in the `node-version` property. Other versions of `node.js`, including newer versions, are not guaranteed to be compatible with other Angular versions.

## Building

To install the required dependencies, run `npm install` in the root folder of the workspace.

To build any library or app, run `npm build <name>`. Note that you must build each library in the correct order; along with any plugins that you want to include. For example, to build `qer-app-portal`, you need to build at least the following in this order:
- `qbm`
- `qer`
- `qer-app-portal`

## Customizing libraries

When changing the code of a _library_, you will need to build and deploy customized versions of all the apps that should use the customized versions. For example, changing `qer` will require that you also compile `qer-app-portal`, `qer-app-operationssupport` and `qer-app-pwdportal` because all of these apps include `qbm`.

When changing the code of a _plugin library_, you will need to build and deploy customized versions of the plugin library itself, and all plugin libraries depending on it. For example, changing `tsb` will require that you also compile `aad` and `o3t` because these plugins include `tsb`.

### Debugging

Running and debugging web applications is possible using the default tools of the Angular CLI toolchain. For example, you can use `ng serve qer-app-portal` to debug the Portal app.

You will need an API Server instance that the web applications will connect to. You can host an API Server locally for development purposes. Run the following command on the command line:

```
imxclient.exe run-apiserver -B
```

The web apps will connect to the API Server using the URL defined in the application's `environment.ts` file. The default setting is `http://localhost:8182` which is the default URL that a local API Server will run on.

## More information

Please refer to the [HTML Development Guide](https://support.oneidentity.com/technical-documents/identity-manager/8.2.1/html5-development-guide#TOPIC-1801966) for step-by-step instructions on getting started.

## Branches and Update Policy

The following table shows the branches in this repository corresponding to each product version.

|Branch|Product version|`node.js` version|
|-|-|-|
|`v91`|Identity Manager 9.1.x|14|
|`v90`|Identity Manager 9.0|14|
|`v82`|Identity Manager 8.2.x|14|
|`master`|The `master` branch does not correspond to a supported version of Identity Manager. Do not use this branch for development purposes.||

We plan to push updates for each minor and major product release, allowing developers to track source code changes from one version to the next. Occasionally we may also publish important bug fixes.

## Contributing

We welcome and appreciate contributions. Here's how you can open a pull request to submit code changes.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

<!-- LICENSE -->
## License

Distributed under the One Identity - Open Source License. See [LICENSE](LICENSE) for more information.

