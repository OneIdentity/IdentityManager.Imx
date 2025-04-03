### March 31, 2025
- The branch v90 is now up to date with the 9.0 CU4 of Identity Manager.
- The repository has been updated with fixes for the following issues. 
  -  449889: Fixes an issue with broken paging in system entitlement memberships.
  -  450101: Security fixes: Path traversal in webpack-dev-middleware.
  -  449955: Fixes an issue with grouping on the pending attestations page -> a second request showed results for the first one.
  -  439884: Fixes an issue with synchronizing typescript entities in case of an error.
  -  442735: Fixing an issue with changing the publish state of automatically assigned entitlements.
  -  447268: Fixing an issue with report subscription -> does not save parameter value in the DB.

### December 7, 2023
- The branch v90 is now up to date with the 9.0 CU3 of Identity Manager.
- The repository has been updated with fixes for the following issues. 
  - 426872 Fixed a bug on policy violations incorrectly using standard justifications
  - 426135 Fixed a bug on self registration of a new user configuration for new portal
  - 415839 Security Fixes für imxweb 9.0 CU3 added
  - 412932 Fixed a bug in parameter handling, which ignores query column settings

### April 24, 2023

- The branch `v90` is now up to date with the 9.0 CU2 of Identity Manager.
- The repository has been updated with fixes for the following issues. 
  - 407514 Fixed the password profile tab selection on the profile page.
  - 319131 Fixed a bug when adding a service item to a request template.
  - 358311, 405872 Fixed a bug when copying an attestation policy.
  - 305110 Fixed a bug when creating dynamic groups.
  - 399901 Fixed a bug in the grouped view of attestation cases.
  - 395047 Fixed a bug on the password profile page.
  - 322939 Fixed a bug that caused the page to load infinitely when loading password profile questions.
  - 386166 Fixed the links on the Packages view of the Administration Portal.
  - 36325 Fixed a bug that was causing the indirect reports view to only show direct reports.
  - 366940 Fixed a bug when running the application without the `RISKINDEX` configuration parameter.
  - 367251 Fixed a bug when approving policy violations.
  - 393864 Fixed a bug in the grouped view of attestation runs.
  - 332087 Fixed OAuth login to the Server Administration app.
  - 352481 Fixed app titles.
  - 386868/36143 Candidates for parameter values were not correctly reloaded.
  - 332393/36057 Publishing of an application entitlement did not work correctly.
  - 388710/36356 The detail sidesheet for a request template did not open correctly.
  - 384912 Login errors were not being handled correctly.
  - 386663 Fixed a bug when adding a service item to a request template.


### November 8, 2022

- The repository has been updated with fixes for the following issues.
  - Dependency updates for CVE-2022-39353
  - 35988: Report subscriptions fail if PDF is not a valid format for the report.
  - Other minor stability and bug fixes

### July 29, 2022

- The repository has been updated with the source code for the Identity Manager 9.0 release in the `v90` branch.
- The build now supports case-sensitive file systems (namely Linux) in the `v90` branch.

### June 7, 2022

- Added clarification on the [branches](#branches-and-update-policy).
- The `v82` branch has been updated with the contents of the 8.2.1 rollup package.
- The build definition has been split into separate steps for each package.

### May 2, 2022

The repository has been updated with the code changes for the Identity Manager 8.2.1 release.