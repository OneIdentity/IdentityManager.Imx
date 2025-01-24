**One Identity open source projects are supported through [One Identity GitHub issues](https://github.com/OneIdentity/IdentityManager.Imx/issues) and the [One Identity Community](https://www.oneidentity.com/community/). This includes all scripts, plugins, SDKs, modules, code snippets or other solutions. For assistance with any One Identity GitHub project, please raise a new Issue on the [One Identity GitHub project](https://github.com/OneIdentity/IdentityManager.Imx/issues) page. You may also visit the [One Identity Community](https://www.oneidentity.com/community/) to ask questions. Requests for assistance made through official One Identity Support will be referred back to GitHub and the One Identity Community forums where those requests can benefit all users.**

# Identity Manager HTML5 applications

## Change log

### January 24, 2025
- 474473: Fixes an issue, with filter data on an application's entitlements page.
- 474693: Fixes an issue with mitigating controls for policy details.
- 443363: Fixes some issues, with entity synchronization in case of an error.
- 474430: Fixes the UI for selected reports on zoomed windows.
- 474754: Fixes an error, when clicking on a compliance rule.
- 472847: Fixes incorrect property binding in the bulk editor.
- 472278: Fixes an issue with the search control on the data source toolbar.
- 472805: Fixes an issue which caused the details of a pending attestation case to change erroneously.
- 458750: Provides a context-sensitive help with better text on the new request page.
- 469219: Fixes filtering issues on the My Pending Requests page.
- 469349: Fixes issues with duplicated requests on data tables.
- 469379: Fixes the number of rows in the attestation run overview.
- 470237: Fixes synchronization issues within the data source toolbar.
- 472616: Fixes grouping for attestation cases.
- 472268: Fixes an issue in the foreign-key property editor, in case of an error.
- 469356: Fixes an issue with delegating attestation case approvals for the Chief Approval Team.
- 473249: Fixes a looping issue in the date-time property editor in case of an error.

### December 11, 2024
- 430843: Fixes an inconsistency in the Attestation History when an approver is defined in multiple sublevels.
- 467451: Fixes some issues with the „Show attestation cases to be approved by chief approval team“ toggle on the Pending Attestation page.
- 472174: Fixes an issue with the data export in data tables, when using additional columns in the configuration.
- 470782: Fixes the information, provided for attestors and receivers.

### November 19, 2024
- 468962: Method confirmGeneral returns a valid value on OkResult.
- 465213: Fixes an infinite loop if the an invalid value is set on a basic CDR.
- 460757: Approval parameters are read/written interactively.
  **Important**: This fix requires the server-side fix 460757 to be installed.
- 468375: Fixes an issue, with the date parsing for data dependencies scripts on the request form.
- 466517: Fixes cut text on the request history page.
- 459617: Fixes an issue with new-line stings on CDR.
- 467387: Adds security fixes for Angular 14.
- 468551: Fixes an issue with changing request parameter for some product bundles.
- 469356: Adds the delegation of an approval to the Pending Attestation pages Chief Approval Team view.
- 469345: Fixes an issue with the orange triangle on the right of the "Settings" gear for to many search results on the request history.
- 467221: Fixes the header markup on several pages.
- 466404: Fixes an issue with using 'today' as the start date, when delegation responsibilities.
- 469865: Fixes an issue with UI text on the System roles page, when adding columns to a table.
 

### October 8, 2024
- 465213: Fixes an infinite loop if the an invalid value is set on a basic CDR.
- 466404: Fixes an issue with setting today's date as the start date of a delegation.
- 464909: Fixes an issue with the removal of IT shop assignments from newly created applications.
- 466217: Fixes timing issues that could cause the search result to become out of sync with the search term entered by the user.

### September 9, 2024
- 463113: Fixes an issue, regarding the "Unsubscribed as from" property, that doesn't work as expected.
- 462249: Fixes the "Property not found: UID_UNSRoot" error, when switching to tab "Child System Entitlements" on the Data Explorer's system Entitlements page.
- 443363: Synchronizes the entity in case of an error.
- 460948:
- 457652 Fixes the missing notification, when request has a Valid From Date in the past and the approver opens the request in the future
- 463491: Fixes the information, that is displayed on _Pending Attestations > Policy violations of attestation case_.
- 271561: Added a CDR editor for bitmask properties.
- 456076: Fixes an issue, regarding the pre-assignment of the recipient via an URL parameter.
- 455439: Fixes an issue, regarding MFA related configuration parameters.
- 271561: Adds a new CDR editor for bitmask properties.
- 456427: Fixes the count for added items on the _Add To Cart_ snackbar message.
- 464618: Fixes an issue regarding custom filter on the manage shops page.

### August 12, 2024
- 459770: Fixed an issue where the request parameter validation result was not working on first input.
- 462048: Fixed an issue with delegation search caching.
- 461659: Fixed an issue regarding delegation or ESet requests on the Request History page.
- 460151: Fixed an issue with the QueryWhereClause evaluation during the value check on updated parameter.
- 460511: Fixed an issue that causes the side navigation on New Request to show search results twice.
- 461414: Fixed the scrollability of the Operation Support Portal's Process view 
- 462785: Fixed an UI issue regarding the alignment for the column "User account is disabled" and its data.


### July 30, 2024

The v92 branch has been updated with fixes for the following issues.

- 459707: Fixed an issue on the New Request page, where only results up to the first child service category were returned.
- 461733: Updated third-party package versions for security reasons.
- 460431: Fixed the export of requests for the chief approval team.
- 458431: Fixed the inconsistent handling of columns that were added/removed from the ServerConfig/ITShopConfig/AccProductProperties configuration.
- 460184: Fixed an issue with starting attestation policies.
- 453124: Fixed a translation issue on the "show selected" view on the New Request page.

### July 3, 2024

We have added a [list of changes from v91 to v92](imxweb/changes/changesFrom9.1.1To9.2.0.md).

The v92 branch has been updated with fixes for the following issues.

- 456920: Error during approval of ITShop equest, if the request contains a parameter with a ValuationScript
- 457344: Members of the chief approval team can't open an attestation case by using a direct URL
- 434023: Fixed loading a saved view using target system filtering
- 458023: Fixed the display of additional approvers in history view
- 455928: Fixed an issue where the Device Ownership menu item was still visible even when the  VI_Hardware_Enabled configuration setting was disabled
- 456918: Added Compodoc sample for MenuFactory
- 458137: The attestation case was saved once before it is approved, which is often unnecessary
- 455931: System entitlements: Restoring view with multiple target systems fails
- 459617: Fixed an issue with line-break characters in CDR editor view components
- 458984: Fixed an issue with formatting script processing
- 455119: The configuration setting `DisableHyperViewNavigation`, scoped to Portal, also affected hyperview navigation in Operations Support Web Portal.
- 455118: Fixed an issue where Operations Support Web Portal accessed a Web Portal endpoint
- 458570: Fixed an issue with showing the currently selected service category and other options
- 458294: Fixed an issue with Hyperview navigation ("Number of primary key columns does not match")
- 454798: Fixed an issue where the list of service items was not updated when requesting by reference user
- 456379: Fixed an issue where a service category's properties were not translated
- 458001: Fixed an issue with theme's color settings not being applied to the login page
- 456786: Fixed an accessibility issue with the entries in a drop-down list
- 456472: Fixed a navigation issue in accountability HyperViews
- 458688: Fixed the plugin view in Administration Portal
- 453124: Fixed the "show selected" button caption on new requests page (issue 134)
- 455930: Fixed an issue with device management menu items still showing when the "Hardware" configuration parameter was disabled

### May 24, 2024

The v92 branch has been updated with fixes for the following issues.

- 453132: Attestation Policies: Edit Attestation Policy: Setting Condition: The objects matching the condition are not displayed hierarchically
- 449292: Fixed an issue during creation of a cart item
- 455291: Fixed the output paths for the compodoc files
- 453350: Fixed an issue where the user could not save dynamic role membership changes after adding another condition to a new role
- 455703: Fixed a state issue of the save button during creation of a report

### May 6, 2024

We are integrating [Compodoc](https://compodoc.app/) to provide Angular documentation for our components. Please see the [Documentation](#documentation) section for more information on how to generate documentation.

The package versions have been updated to 9.2.1.

The `v92` branch has been updated with fixes for the following issues.

**Important**: Integrating these changes will require a server-side hotfix for the issue 454356 to be installed if the server has _not_ been upgraded to 9.2.1.

- 454675: Fixed an issue where sometimes a blank screen was displayed instead of the login page
- 446439: Fixed the preselection of a child service category on the new request page
- 440745: Fixed the preset of the search term on the new request page
- 454356: Data Explorer identities needs to load interactive entities.
- 453350/447417/453346: Fixed issues where the filter wizard could enter an inconsistent state
- 453132: Fixed an issue in the attestation policy editor where the "objects matching the condition" were not displayed hierarchically
- 438231: Added documentation of some basic components
- 450070: Fixed an issue where switching to another page while loading a page caused an error
- 453932: Fixed an issue where approving multiple requests in bulk could cause an error
- 439918: Fixed some issues in the product bundles component
- 450675: Fixed an issue where some help text was shown in an incorrect language
- 452886: Fixed an issue in the attestation policy editor
- 449616: Fixed an issue where reports could not be saved in format other then PDF
- 450404: Fixed an issue in the overview of attestation case approvers.
- 442324: Duplicate (additional) "Target system" columns in the Data Explorer
- 448531: Fixed a scrolling issue on the organizational chart view
- 449891: Fixed the inherited group membership pagination
- 448406: Fixed an issue where the list of entitlements assigned to a role was incomplete
- 418493: Fixed an issue in the overview of request approvers
- 447713: Fixed a styling issue with the login button
- 449124: Fixed the declaration of the metadata service
- 447723: Fixed an issue with additional columns in a grouped table view
- 442324: Fixed the duplicate "Target system" columns in the Data Explorer
- 447039: Fixed an issue where the FK picker could enter an inconsistent state

### March 11, 2024

The v92 branch has been updated with fixes for the following issues.

- 447996: In DataSource Toolbar, opening a view which has custom filters, adds custom filters to the GET, but not the UI
- 447997: In DataSource Toolbar, Reset view removes custom filters from GET, but not from the UI
- 447702: Filtering: Canceling defining a filter does not reset filters (reappearing)
- 446439: Portal should support pre-selections by URL parameter
- 442023: Add configuration to globally enable HyperView navigation
- 446435: Attestation case details: Object picker in hyperview tab shows user-friendly display names
- 448406: Not all entitlements were visible in the product request details for a role
- 446478: The number of pending requests and shopping cart items were not being updated correctly.
- 447474: Fixed masthead color when applying a custom theme

### February 28, 2024

The v92 branch has been updated with fixes for the following issues.

- Bug 447702: Web Portal: Filtering: Canceling the definition a filter does not reset filters (reappearing)
- Bug 447018: In Data Explorer System Entitlements, the defaultness of a table column can be changed by loading a view
- Bug 444890: Portal: Selected products on New Request page are not reloaded when user changes
- Bug 434023: Filtering user accounts by target system, when loaded a saved view, causes UI issues
- Bug 446516: User dependent column cache in filter wizard does not update when user changes
- Bug 446585: My responsibilities / System entitlements: Child system entitlements: Odd/empty target system information
- Bug 445251: Clicking while load spinner is visible prevents result sidesheet to remain open
- Bug 445482: Risk index functions are visible when RISKINDEX condition is off
- Bug 444322: Address book: Added column disappears in grouping
- Bug 444321: Attestation runs - Run numbers column loses values when grouping
- Bug 442287: Attestation runs - Run numbers column from saved view shows zero values
- Bug 444543: Additional manager has no permission to access 'Create application role' side sheet
- Bug 444268: Portal: Selected products when selecting products by reference user disappear
- Bug 418493: List of current approvers is incomplete as sibling steps of the current decision level are ignored
- Bug 425801: The shopping cart does not suggest that a partial check or partial submit is possible
- Bug 445856: Github: CDR required logic was inverted
- Bug 446295: Github issue 112: Unable to save the changes to a dynamic business role after adding another condition
- Bug 446190: Data Explorer / History sidesheet tab: switching from "Timeline" to "Table" view resets the date filter
- Bug 444602: Github: Filtering not working on account-sidesheet
- Bug 445927: Administration Portal: On smaller screens the menu is not visible
- Bug 445169: Operations Support Portal: Operation history: Type of operation not shown when language is German
- Bug 442577: Column picker for view configuration shows wrong columns
- Bug 420941: Web application overview: Clicking the title opens the Administration Portal
- Bug 446290: Portal: System entitlement ownership: Drop-down list does not load all entries
- Bug 447700: Portal: New request: Tabs are not using context-sensitive help
- Bug 447417: In Filter Data sidesheet, custom filters for properties, which have datatype double, allow non-numerical values
- Bug 446996: Only 20 child categories of a service category are displayed on the New Request page
- Bug 443469: In Filter Data sidesheet, existing custom filters can be mutated , even if the user cancels the sidesheet
- Bug 446342: Web Portal: Hyperviews: Clicking some tiles only reloads the currently displayed hyperview and breaks navigation history
- Bug 446263: Product bundle selection: Text search overrides Custom filters instead of narrowing down its results
- Bug 446162: Data Explorer: Missing date restriction in Status comparison view
- Bug 446188: Data Explorer: Switching history view from "Events" to "Status overview" and back produces date filter that does not match the events shown
- Bug 446167: Hyperview navigation from object shape does not work
- 440883: Portal: Pending attestations: Hyperviews: Add object types to list
- 438294: Portal allows navigation in Hyperviews
- Bug 432848: New Request: within the view of selected products, sorting was not correctly implemented
- Bug 443469: In Filter Data sidesheet, existing custom filters can be mutated in sneaky ways, even if the user cancels the sidesheet
- Bug 441058: Portal: Select page index is not reset when the filter changes

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
- Bug 432826: In Data Explorer, Business Roles, custom filters cannot be added or removed, instead they raise JS errors.
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

| Name  | Type                   | Dependencies inside the workspace |
| ----- | ---------------------- | --------------------------------- |
| `qbm` | Angular library        | none                              |
| `qer` | Angular library        | `qbm`                             |
| `tsb` | Angular plugin library | `qbm`, `qer`                      |
| `att` | Angular plugin library | `qbm`, `qer`                      |
| `rms` | Angular plugin library | `qbm`, `qer`                      |
| `rps` | Angular plugin library | `qbm`, `qer`                      |
| `aad` | Angular plugin library | `qbm`, `qer`, `tsb`               |
| `aob` | Angular plugin library | `qbm`, `qer`                      |
| `uci` | Angular plugin library | `qbm`, `qer`                      |
| `cpl` | Angular plugin library | `qbm`, `qer`                      |
| `hds` | Angular plugin library | `qbm`, `qer`                      |
| `dpr` | Angular plugin library | `qbm`                             |
| `o3t` | Angular plugin library | `qbm`, `qer`, `tsb`               |
| `olg` | Angular plugin library | `qbm`, `qer`                      |
| `pol` | Angular plugin library | `qbm`, `qer`                      |

Each Angular library belongs to the Identity Manager module of the same name. You do not need to build Angular libraries for modules that are not part of your Identity Manager installation.

A (non-plugin) library acts like a regular compile-time dependency. A _plugin_ library is loaded dynamically at runtime, as determined by each plugin's `imx-plugin-config.json` file.

For more information about each project, see the `readme.md` files in each project's folder.

### Angular apps

| Name                        | Description                                       | Project type | Static dependencies |
| --------------------------- | ------------------------------------------------- | ------------ | ------------------- |
| `qbm-app-landingpage`       | API Server landing page and Server Administration | Angular app  | `qbm`               |
| `qer-app-portal`            | Portal                                            | Angular app  | `qbm`, `qer`        |
| `qer-app-operationssupport` | Operations Support Portal                         | Angular app  | `qbm`, `qer`        |
| `qer-app-pwdportal`         | Password Reset Portal                             | Angular app  | `qbm`, `qer`        |
| `custom-app`                | Template for custom applications                  | Angular app  | `qbm`               |

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

| Branch   | Product version                                                                                                                      | Angular version |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| `v92`    | Identity Manager 9.2.x                                                                                                               | 14              |
| `v91`    | Identity Manager 9.1.x                                                                                                               | 13              |
| `v90`    | Identity Manager 9.0                                                                                                                 | 13              |
| `v82`    | Identity Manager 8.2.x                                                                                                               | 11              |
| `master` | The `master` branch does not correspond to a supported version of Identity Manager. Do not use this branch for development purposes. |                 |

Please also see the [version compatibility table](https://angular.io/guide/versions).

We plan to push updates for each minor and major product release, allowing developers to track source code changes from one version to the next. Occasionally we may also publish important bug fixes.

## Step-by-step guides

- [Theming guide](./imxweb/custom-theme/readme.md)
- [CDR guide](./imxweb/projects/qbm/src/lib/cdr/Readme.md)

## Documentation

There are two ways to install the documentation locally. The result will be stored in _\imxweb\documentation\<projectname>_.

### 1. Using Compodoc (preferred)

1. Install the Compodoc package globally by running `npm install -g @compodoc/compodoc`.
2. Navigate to the library to create documentation for (e.g. `imxweb\projects\qer`).
3. Run `compodoc -p tsconfig.lib.json` for a library or `compodoc -p tsconfig.app.json` for an application.

### 2. Using npm only

This method only works for `qbm`, `qer` and the applications.

1. Navigate to _imxweb_.
2. run `npm run doc:<projectname>`

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
