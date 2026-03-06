### March 6, 2026
- 696400: Fixes an issue with paging in grouped attestation cases due to a missing StartIndex property.
- 695798: Fixes an issue with direct product access via URL when login is required, and the user has a display language configured.
- 648348 (648345): Adds historical attestation decisions for an object.

### Febraury 12, 2026
- 6487639  Fixes an issue with unsupported system role creation.
- Minor npm audit fix.
- 653264: Fixes an issue with the error handling when the session expires.
- 652604 (652590): Fixes an issue with inquiries that are between the same two people.
- 651891: Fixes an issue with approvals while the process is still queued.
- 652702: Fixes an issue with approvals via email links.
- 496654 (496653): Adds an editor for decimal range report parameters.
- 519009 (506868): Fixes an issue with the approval of policy violations.
- 647172: Fixes an issue with deleting custom configuration keys in the Administration Portal.
- 653182: Fixes an issue with the translation of the 'Display name' column.
- 651830: Fixes an issue with column-dependent reference editors: Validation errors by the server lead to a loop.
- 508572: Fixes an issue with the "Readonly" property on a service item, which could be changed, although the value was read-only.

### January 9, 2026
Bug 601765: Fixes an issue with the list of potential approvers if an approval step is configured with multiple approvers.
Bug 648439 (647230): Fixes an error message that is displayed if the user likes to approve a request.
Bug 647621: Fixes an issue in the Operation Support Portal if the user clicks on the details of a job server.
Bug 646056: Fixes an issue with renewing a request that has a maximum valid days defined.

### November 18, 2025
- 545983 (545530): Fixes an issue with mandatory fields when editing a request in the shopping cart.
- 581733 (549535): Fixes an issue with displaying the approval page when there are no items to approve.
- 622249 (579339): Fixes an issue with exporting attestation run data.
- 621618 (621462): Fixes an issue with dependency scripts that are updating the `isMandatory` property.
- 604627: Fixes UI issues after changing the user language.
- 546758 (546757): Fixes multiple issues with the Job Server Overview page.

### October 17, 2025

- 508158 (499229): Fixes an issue with the hyperview on Compliance -> Policy violations.
- 494396 (494373): Fixes an issue with duplicate names on System Roles -> View Settings -> Additional columns.
- 470423: Adds terminology of union view SAPGroup.
- 508772 (502012): Fixes an issue with error messages for server validations.
- 519009 (506868): Fixes an issue with approving violations on the Pending Requests page.
- 493153: Fixes an issue with direct links to IT shop approvals.
- 542152 (493140): Fixes an issue with requests that are approved using an email link when the request was already approved.
- 542744: Fixes an issue with server-side error messages on request properties that contain a request property parameter that is a multi-foreign-key value.
- 544148 (489411):  Fixes an issue with adding items from shopping card bundles that have more than 20 items.

### August 26, 2025
- 488098 *(479191)*: Fixes an issue with duplicated session calls in the portal.
- 505567 *(501784)*: Various web maintenance tasks implemented.
- 505891 *(505565)*: Fixes a UI issue on the login page, that prevents a captcha from being entered when the scaling is set to 150%.
- 495789: Fixes an issue with unlisted service items from product bundles.
- 505552 *(501788)*: Fixes an issue with server-side error messages on request properties that contain a request property parameter that is multi value.
- 498992: Fixes an issue with reports that only have pre-filled parameters and were showing a blank page.
- 503449: Fixes an issue with viewing and editing rights for a user on the data explorer.
- 505517: Fixes an undefined value exception when using deeplinks in combination with OAuth (Github #356).
- 502012: Fixes an issue with date and time validation in the shopping cart. An error was thrown infinitely.

### August 8, 2025
- 504964 *(502690)*:  Fixes an issue with server-side error messages on request properties that contain a list of permitted values.
- 504872 *(500296)*: Fixes an issue with showing very long decimal numbers.
- 504893 *(500816)*: Fixes an issue with the wrong error message when entering an invalid date for an approval
- 502012: Fixes an issue with date time validation in the shopping cart, which causes an error to be thrown infinitely.
- 504865 *(502805)*: Fixes a display issue with entitlement loss for a single attestation case, although multiple are selected.
- 491804: Fixes an issue with custom filtering on UNSContainer, which may display different containers with the same indistinguishable value.
- 494594: Fixes an issue with custom filtering the request history on reserved requests, which ignores the previously set text filter.
- 503322 *(501310)*: Fixes an issue where the chief approval team can't delegate requests.
- 503159 *(503133)*: Fixes an issue with a missing paginator on request history > view entitlements.
- 503039 *(502448)*: Fixes an issue with the Slovenian format on date controls.
- 502483: Fixes an issue with the My Direct Reports tile, which allows for identity creation although disabled otherwise.

### July 25, 2025
- Packages updated to 9.3.1
- 499192 *(496637)*: Fixes an issue with missing renewal dates on the Pending Attestations page.
- 497218: Fixes an issue with deep links that freeze the selected company policy of the policy violations page
- 501688 *(501314)*: Fixes an issue with reloading achieved requests after the identity is changed.
- 500294 *(497103)*: Fixes an issue with the units displayed on statistics.
- 500552 *(497578)*: Fixes an issue with the assignment of mitigating controls to a policy violation on the policy violations page.
- 497425: Fixes an issue with the management of e-mail notification on a user's profile page.
- 496475 *(489057)*: Fixes an issue with cut-off labels on the x-axis of statistics.
- 480248: Fixes an issue with resetting the search on the Request page.
- 496323: Fixes some security issues.
- 487046 *(486606)*: Fixes an issue with preventing the submission of a request while a validation is ongoing.

### July 11, 2025
- 496243 *(496242)*: Fixes an issue with the sorting in the history view.
- 470865: Provides an API documentation for our new data-table.
- 496590 *(496025)*: Fixes an issue regarding error messages on multi-line component dependent reference editors, whenever a server error occurs.
- 496475 *(489057)*: Fixes an issue with cut off labels on the x-axis of statistics.
- 496641: Fixes an issue with the rendering of a account report.
- 496646: Fixes an issue with correct filters after using deep links to the policy violation approval page.
- 496654 *(496653)*: Adds support for decimal range report parameters.

### June 13, 2025
- 495784: Fixes an issue with submitting requests while a validation is ongoing.
- 481927 *(480466)*: Fixes an 404 error on approve/deny request.
- 492327 *(484186)*: Fixes an exception when deciding a request as a member of the chief approval team.
- 493673 *(474749)*: Fixes an issue with wrong sublevels when the same person can approve a request again in the same level.
- 474724: Fixes an issue with the Cancel reservation button that is shown even though inquiry is not answered yet.
- 493494: Adds sorting options to rule violations.
- 488099 *(463113)*: Fixes an issue with the date field unsubscribing an assigned request.
- 493438 *(491726)*: Fixes an issue with saving a view on the Responsibility -> System Roles page.
- 490160: Fixes an issue with the culture formatting in the identity history.
- 488101 *(474430)*: Fixes an issue with zooming in on the parameter section of a selected report.
- 484625: Fixes an issue with the CAPTCHA based login on the custom-app.
- 488853: Fixes links in readme files.
- 491498 *(489984)*: Fixes an issue with the CAPTCHA prompt on the Password Reset Portal (it was not display again after a wrong input)

### May 20, 2025
- 486313: Fixes an issue with scroll bars in the View Report side sheet.
- 483185 *(483102)*: Fixes an issue with deep links in the mail body of send inquiries.
- 468349: Fixes an issue with direct re-assignment of product owner memberships.
- 488906 *(488905)*: Fixes an issue with a too early closed tag.
- 459188: Fixes an issue with missing Attestor filters.
- 487103 *(486602)*: Fixes an issue with editing old-style request property values by an approver.
- 463958: Fixes an issue with wrong value formatting.
- 488888 *(485595)*: Fixes an issue with error messages, that were shown with quotes.
- 486986: Fixes an issue with clearing checkboxes.
- 481878: Adds more information for the approver to know exactly which violation needs to be exceptionally accepted
- 489728: Fixes an issue with editing UINT based parameter in the attestation wizard.
- 486921 *(486644)*: Fixes an issue while loading the  Business Roles > Entitlements > Request Entitlements page.
- 490279 *(489994)*: Adds sorting, additional columns and export to list report viewer.
- 487535: Fixes an issue with error handling on the identity history page.
- 481958: Fixes another issue with duplicated HTTP Requests
- 490344 *(481171)*: Fixes an issue with the sorting of additional columns.
- 490276: Fixes an issue with the calculation of risk index analysis for DEC functions.
- 491848 *(489974)*: Fixes an issue with the editing of request properties that contains at least on read-only property (Github issue).
- 492128 *(489184)*: Fixes an issue with saving the reason while canceling the reservation (was not displayed anywhere).

### April 16, 2025
- Main work item ID added in brackets if it differs from the current one
- 486926 *(460757)*: Approval parameters are read/written interactively. **Important**: This fix requires the server-side fix 486926 to be installed.
- 474724: Fixes an issue with the display of the Cancel reservation button if the inquiry is not answered yet.
- 481018: Fixes information that are displayed for pending request (waiting for decision).
- 487654: Fixes an issue with the data export in the address book.
- 471940: Fixes an issue with reordering the columns in the AdditionalColums dialog.
- 469661: Improves error handling on the new request page.
- 475962 *(475616)*: Fixes an issue while navigating directly to the attestation page if a user is not authenticated.
- 486485 *(484003)*: Fixes an issue with duplicated options shown in the My Responsibilities: Identities page.
- 483430: Fixes an issue with the Products expiring soon list on the start page (only listed items where the current user has not been the requester).

### March 31, 2025
- 483304: Fixes the text that is displayed if no membership is assigned to an identity.
- 482336: Fixes an issue with the hierarchical foreign key editor that was using the wrong column for data values.
- 474724: Fixes an issue with the cancel reservation button
- 477793: Fixes an issue at the new identity side sheet: wrong array is checked.
- 471969: Fixes the data export on reports by adding filter configurations to the request.
- 480222: Fixes an issue with workflow histories, that are containing to many items.
- 480361: Fixes an issue with loading membership candidates using POST.
- 480175: Inherited memberships tab is only shown if the entity is an Active Directory Group.
- 473934: Fixes an issue with showing the data table on the new request page after deleting properties in the Admin Portal.
- 475617: Fixes an issue with assigning a manager after user access attestation.
- 474885: Fixes an issue with updating the edit origin component when the condition type of an attestation policy changes.
- 474805: Fixes an issue with clicking on a Compliance Rule in Compliance\Compliance Rules.
- 481595: Fixes an issue with grouping on the pending attestations page -> a second request showed results for the first one.
- 479701: Fixes an issue with aborting duplicate requests.
- 473691: Fixes an issue with duplicated calls, when components are loaded more than once.
- 474556: Fixes an issue with the attestation policies editor, if the condition type 'System entitlements by assignment origin' is selected.
- 478485: Fixes the layout of the new request details side sheet.
- 478652: Fixes an issue with displaying the wrong data for an Attestation run.
- 481270: Fixes the layout of an empty shopping cart.
- 461841: Fixes an issue with dynamically hidden CDR editors.
- 482650: Fixes an issue with setting a filter for a report.
- 480359: Fixes an issue with empty entries after removing a filter during loading the Request History.
- 482760: Fixes an issue with the products expiring soon tile not updating without logging out and in again.
- 472460: Fixes an issue with refreshing the CAPTCHA value after failed logins.
- 469774: Fixes an issue with past dates while approving pending requests.
- 473380: Adds alt tags to images to improve accessibility.
- 468200: Fixes an issue with the current manager not being available as a potential new assignee when re-assigning responsibilities.
- 471891: Adds sorting to the data table.
- 475962: Fixes an additional issue with navigating directly to the attestation, while a user is not authenticated.
- 474708: Fixes an issue with filter selection for parameters.
- 476081: Fixes an issue with revisiting the login page, while a user is logged in.
- 478009: Fixes an issue with deleting products from the shopping cart when a product request is canceled.
- 471894: Fixes an issue with querying data for deactivated charts leads.
- 470776: Fixes a wrong data point for session counter in the Administration Portal.
- 471020: Fixes an issue with the display style of statistics when searching to clarify the context.
- 470961: Fixes rendering problems for dashboards.
- 468633: Fixes the entitlement loss dialog, when denying an attestation case.
- 471290: Adds sorting to statistics page.
- 471026: Fixes an issue with the numbers that are displayed on chart statistics.
- 462148: Fixes an issue with updating the policy collection page, after a collection is deleted from the side sheet.
- 470481: Fixes an issue with empty attestation cases after a bulk action denial.
- 475090: Fixes an issue with potential unsafe use of `bypassSecurityTrustResourceUrl`.
- 478329: Fixes an issue with filtering for multiple values.
- 479060: Fixes the layout on the Administration Portal Configuration page. Customized badge was too close to the name of the configuration key.
- 480219: Fixes an issue with applying the proper filter after clicking on the Expiring Soon tile.
- 479059: Fixes an issue with the translation of the filter on the Administration Portal Configuration page.
- 480662: Fixes an issue when displaying the company logo or the One Identity logo.
- 470052: Fixes an issue with adding invalid recipients using URL parameter.

### January 20, 2025

Note: The Linux build is currently not working, we are investigating the issue.

- 471969: Fixes an issue with data export in combination with filter configurations.
- 430844: Fixes an inconsistency in Attestation History when an approver is defined in multiple sublevels.
- 470581: Fixes an issue with delegation missing in the attestation cases approval process for the Chief Approval Team.
- 474717: Fixes issues with clicking on Mitigating Controls tab in policy details cause.
- 472678: Fixes an issue with initial filter definitions
- 470994: Fixes some UX issues on the Attestation runs page.
- 465262: Fixes issues with the package-log.json.
- 454186: Hides statistics with missing data.
- 474772: Adds sorting of entries in the history view.
- 466611: Fixes an issue with preselected product bundles.
- 472739: Fixes issues with the Data Explorer menu structure if the user lacks permissions.
- 459188: Fixes an issue with the attestor filter on the Attestation history page.
- 443363: Fixes an issue with synchronizing entities in case of an error.
- 469777: Fixes empty validation massages on the Operation support portal's Operation history page.
- 465328: Fixes an issue with additional columns on tables.
- 468193: Fixes an issue with re-assigning direct, single responsibilities of the Responsibilities of My Reports page.
- 470449: Fixes product image sizes in the Product selection side sheet.
- 473445: Fixes an issue with switching identities on the Profile page.
- 470722: Fixes the view of rule violations with SAP functions.
- 453126: Fixes an issue with false property binding on bulk editors.
- 472698: Fixes an issue with the search control on the data source toolbar.
- 470472: Adds an indication to the product bundle page when there is no data.
- 447722: Fixes an issue which caused the details of a pending attestation case to change erroneously.
- 468592: Fixes an issue with occurring error loops while picking an additional approver.
- 470706: Fixes issues with the grouping on the My Responsibilities page when using the toggle button.
- 460921: Fixes issues with the history view on the My Responsibilities/Data Explorer page.
- 470603: Fixes the layout of the Password Reset Portal login page.
- 474716: Fixes an issue regarding a wrong data source, when filtering on the Request New Membership side sheet.
- 468855: Fixes validation issues on the Delegation page.