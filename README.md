**One Identity open source projects are supported through [One Identity GitHub issues](https://github.com/OneIdentity/IdentityManager.Imx/issues) and the [One Identity Community](https://www.oneidentity.com/community/). This includes all scripts, plugins, SDKs, modules, code snippets or other solutions. For assistance with any One Identity GitHub project, please raise a new Issue on the [One Identity GitHub project](https://github.com/OneIdentity/IdentityManager.Imx/issues) page. You may also visit the [One Identity Community](https://www.oneidentity.com/community/) to ask questions.  Requests for assistance made through official One Identity Support will be referred back to GitHub and the One Identity Community forums where those requests can benefit all users.**

# Identity Manager HTML5 applications

## Change log
### January 16, 2024
The v92 branch has been updated with fixes for the following issues.
- Bug 441844: In Filter Data sidesheet, within Custom Filters, picking a different limited value does not cause the form to be submittable
- Bug 441185: Exception when trying to add entitlements to a role
- Bug 427186: Exporting table views: "Export Data"-SideSheet: Names of columns to export ignores the user interface setting "Use profile language"=OFF
- Bug 436033: Extra word in the no-data message for Archived Requests
- Bug 439550: Tiles no longer update the number of open items
- Bug 441967: Requests: Product bundles: Changes to product bundles are applied to overview table without saving 
- Bug 439915: New request: Product bundles: Filter icon and search bar displayed incorrectly/cut
- Bug 433912: In Edit Identity sidesheet, within Rule Violations tab, upon searching, filtering or paging, the data table gets more and more columns
- Bug 441745: Search by keywords: Unnecessary space before colon
- Bug 441753: User interface settings: When clicking on "Reset" not the default theme will be applied, but the Device Theme
- Bug 441217: Github bug: Custom theming is ignored by default config parameter
- Bug 441754: Manually reloading page resets the theme
- Bug 441167: Compliance rules: Rule violations: Buttons are displayed although identity has no permission to decide
- Bug 441122: Sorting: "Search" is not translated
- Bug 441320: Inactive identities listed in "My Direct Reports" start page tile but not if you follow the "VIEW" link of that tile
- Bug 440754: Compliance Rules: Defining filters on "View Compliance Rule Details sidesheet" also applies filter to "Compliance Rules" page; results in bugged out Material Chips and JS errors (TypeError: e is undefined)
- Bug 440143: Grouping a data table, after additional columns were added, results in 400 Bad Request in most pages
- Bug 441161: The "No Product Bundle Selected" information disappear 
- Bug 439720: Drop-down CDR editor clears itself too easily
- Bug 440478: HTML5-Web: Missing scrollbar in View Attestation Run Details\Attestors in OneIM 9.2.0 (issue does not exist in 9.1.1)
- Bug 440952: Requests: Pending requests: Useless information in details of a request
- Bug 439739: Duplicate service categories on the request page
- Bug 441943: Logs - Time filter LDS key is wrong
- Bug 441975: Chip container of Datasource-Toolbar is displayed in the same row together with search box and buttons
- Bug 442118: Parameter filter tree does not work
- Bug 442119: Changed permission notification: Several errors when clicking notification
- Bug 439266: Data Explorer doesn't open
- Bug 440720: Compliance Rules with custom view set as default - TypeError: Cannot read properties of undefined (reading 'headerCell')
- Bug 326746: Application Governance: Cannot change publish state of automatically assigned entitlements
- Bug 442711: Exception after closing filter: TypeError: Cannot read properties of undefined (reading 'dirty')
- Bug 443104: In DataSource Toolbar, for grouped results, changing the column order results in seemingly arbitrary column ordering
- Bug 439914: New request: Product bundles: Product bundle selection: Custom filters not working
- Product Backlog Item 440711: Implemented proposals from git hub
- Bug 442757: Admin Portal: The labeling of the Y-axis of the session charts is not recognizable
- Bug 443316: ServiceCategoryComponent snackbar message are not translated

### December 12, 2023
- Added some [code samples](sdk_samples/README.md) with explanations.

### December 7, 2023
The v92 branch has been updated with fixes for the following issues.
- Add missing translation keys
- Bug 432754: In Filter Data Sidesheet, by toggling a predefined filter, client side validation can be bypassed, which causes frontend and backend errors.
- Bug 432757: In Filter Data Sidesheet, by editing a custom filter, multiple copies of the same filter is appended to the url growing it to huge lengths.
-  Bug 432826: In Data Explorer, Business Roles, custom filters cannot be added or removed, instead they raise JS errors.
- Bug 435259: Portal: The title of the PeerGroupDiscardSelectedComponent dialog is not translated.
- Bug 433890: In DataSource Toolbar, overriding an existing saved view adds a new saved view entry to the UI.
- Bug 436537: 9.2 - Operations Portal: bug in Pending Provisioning Process.
- Bug 433973: Configuration key "Request configuration / Products can be requested through reference user" has no effect.
- Bug 433974: Configuration key "Request configuration / Product bundles can be used" has no effect.
- Bug 433925: UI fix: My processes page crops content.
- Bug 439229: Attestation Runs page simply does not apply the custom filters to the GET request.
- Bug 434024: Special filtering, like User Accounts Target system based narrowing, does not properly work with other filters.
- Bug 433599: Operations Support Portal: Password Tab is empty.
- Bug 438828: Security Fix: Update crypto-js to version 4.2.0.
- Bug 438829: Security Fix: Update @babel/traverse to version 7.23.2.
- Bug 440143: Grouping a data table, after additional columns were added, results in 400 Bad Request in most pages.
- Bug 440283: Error opening sidesheet in addressbook - TypeError: Reduce of empty array with no initial value.
- Bug 440037: OpsWeb cannot be started (endless loop).


### October 20, 2023

- The repository has been updated with the source code for the Identity Manager 9.2 release in the `v92` branch.
  For information about new features and enhancements in this version, please refer to the Identity Manager 9.2 Release Notes.

### October 15, 2022

- There is a new application in the workspace called `custom-app`. This application is a template that provides the basic building blocks (such as Material integration, session handling, login, and the API client configuration) can be used as a starting point for building new applications. See [`readme.md`](./imxweb/projects/custom-app/readme.md) for more information.

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

We strongly recommend to read the [HTML Development Guide](https://support.oneidentity.com/technical-documents/identity-manager/9.2/html5-development-guide) before starting to work with the code in this repository.

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

Each Angular library belongs to the Identity Manager module of the same name. You do not need to build Angular libraries for modules that are not part of your Identity Manager installation.

A (non-plugin) library acts like a regular compile-time dependency. A _plugin_ library is loaded dynamically at runtime, as determined by each plugin's `imx-plugin-config.json` file.

For more information about each project, see the `readme.md` files in each project's folder.

### Angular apps

|Name|Description|Project type|Static dependencies|
|-|-|-|-|
|`qbm-app-landingpage`|API Server landing page and Server Administration|Angular app|`qbm`|
|`qer-app-portal`|Portal|Angular app|`qbm`, `qer`|
|`qer-app-operationssupport`|Operations Support Portal|Angular app|`qbm`, `qer`|
|`qer-app-pwdportal`|Password Reset Portal|Angular app|`qbm`, `qer`|
|`custom-app`|Template for custom applications|Angular app|`qbm`|

## Installing Node.js

Verify that you have installed a compatible `node.js` version for your branch. The version used by the CI build is defined in the [`.github/workflows/npm-build.yml`](.github/workflows/npm-build.yml) file in the `node-version` property. Other versions of `node.js`, including newer versions, are not guaranteed to be compatible with other Angular versions. Please see the [version compatibility table](https://angular.io/guide/versions) on the official Angular site.

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

## Getting started

Please refer to the [HTML Development Guide](https://support.oneidentity.com/technical-documents/identity-manager/8.2.1/html5-development-guide#TOPIC-1801966) for step-by-step instructions on getting started.

## Branches and Update Policy

The following table shows the branches in this repository corresponding to each product version.

|Branch|Product version|Angular version|
|-|-|-|
|`v92`|Identity Manager 9.2.x|14|
|`v91`|Identity Manager 9.1.x|13|
|`v90`|Identity Manager 9.0|13|
|`v82`|Identity Manager 8.2.x|11|
|`master`|The `master` branch does not correspond to a supported version of Identity Manager. Do not use this branch for development purposes.||

Please also see the [version compatibility table](https://angular.io/guide/versions).

We plan to push updates for each minor and major product release, allowing developers to track source code changes from one version to the next. Occasionally we may also publish important bug fixes.

## Step-by-step guides

- [Theming guide](./imxweb/custom-theme/readme.md)
- [CDR guide](./imxweb/projects/qbm/src/lib/cdr/Readme.md)

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

