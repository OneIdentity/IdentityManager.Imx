### April 3,2025
- 476149: Fixes an issue with updating the edit origin component when the condition type of an attestation policy changes.
- 456921: Fixes an issue with requests containing a parameter with a ValuationScript when approving the request.
- 443362: Fixes an issue with synchronizing entities in case of an error.
- 457653: Fixes an issue with approving requests if the valid from property is in the past.
- 459379: Fixes an issue with formatting scripts.
- 450356: Patches the imxweb with security fix for path traversal in the webpack-dev-middleware
- 479744: Fixes an issue with duplicate requests.
- 481539: Fixes an issue with grouping on the pending attestations page -> a second request showed results for the first one.
- 464037: Fixes an issue with the hotfix generation process: delivers too many files.
- 449890: Fixes a issue with broken paging on system entitlement memberships.


### May 7, 2024

The package versions have been updated to 9.1.3.

The `v91` branch has been updated with fixes for the following issues.

- 418493:Fixed an issue in the overview of request approvers
- 449890: Fixed the inherited group membership pagination
- 449915: Fixed an inconsistency with the pending item display after approving a request
- 452771: Fixed an issue in the overview of attestation case approvers

### March 11, 2024
- 440206: When a request is added to the cart, request properties were sometimes not correctly applied to the shopping cart item.
- 446476: The number of pending requests and shopping cart items were not being updated correctly.
- 440741: Portal: Fixed support for ProductSearchString URL parameter for product selection.

### February 2, 2024
- 433272 Backport dynamic parameter change functionality
- 416558 Data Explorer: Assignment analysis of shops cannot be displayed
- 427942 The UI offers too many reports for selection for a subscription
- 433649 Web Portal: Start attestation: Can't select objects to be attested if attestation policy uses sample data
- 442731 Web Portal: Application Governance: Cannot change publish state of automatically assigned entitlements
- 444244 Angular displays incomplete list of current approvers (sibling steps of the current decision level are ignored)
- 443439 Requesting several memberships at the same time results in multiple shopping carts
- 428177 HTML5 Angular WebPortal: API Documentation page, when clicking on the methods probably all result in the error: Could not render ue, see the console
- 437358 Security Fix: Update @babel/traverse to version 7.23.2
- 440281 Error opening sidesheet in addressbook - TypeError: Reduce of empty array with no initial value
- 417655 Portal: Search in DataTables waits for all requests and show the results of the last ended request
- 431112 UI Web Bug: Group by Attestation policy
- 438835 Security Fix: Update crypto-js to version 4.2.0
- 438764 npm audit & update package versions
- 442101 WebDesigner WebPortal: press enter when the pointer is in the filter-popup of a grid column with a list of checkboxes for limited values leads to an error
- 441693 Tiles no longer update the number of open items
- 439667 Inactive identities listed in "My Direct Reports" start page tile but not if you follow the "VIEW" link of that tile
- 443277 In DataSource Toolbar, for grouped results, changing the column order results in seemingly arbitrary column ordering
- 443261 Parameter filter tree does not work
- 441693 Tiles no longer update the number of open items
- 441048 Github issue: billboard semvar has a breaking change
- 417916 New Request Page, ServiceCategoryListComponent, checkbox's and application's state are not in sync

### September 1, 2023

The `v91` branch has been updated with fixes for the following issues.

- 426598 The counter of selected optional products was sometimes showing an incorrect value
- 427961/37144 Adding items to the shopping cart did not work
- 426872 Policy violation was not using the correct set of standard justifications
- 426767 Fixed UI layout in request approval sidesheet
- 415340 Password Reset Portal was sometimes hanging at the loading screen
- 424223 Refactoring of sidesheet closing (https://github.com/OneIdentity/IdentityManager.Imx/pull/65)
- 419508 Application Governance KPIs were not correctly adapting to the screens ize
- 423861/36856/423948 Fix UI when a manager has only indirect, but no direct reports
- 421566 Fix LDS keys for product names

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