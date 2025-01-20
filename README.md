**One Identity open source projects are supported through [One Identity GitHub issues](https://github.com/OneIdentity/IdentityManager.Imx/issues) and the [One Identity Community](https://www.oneidentity.com/community/). This includes all scripts, plugins, SDKs, modules, code snippets or other solutions. For assistance with any One Identity GitHub project, please raise a new Issue on the [One Identity GitHub project](https://github.com/OneIdentity/IdentityManager.Imx/issues) page. You may also visit the [One Identity Community](https://www.oneidentity.com/community/) to ask questions. Requests for assistance made through official One Identity Support will be referred back to GitHub and the One Identity Community forums where those requests can benefit all users.**

# Identity Manager HTML5 applications

## Change log

### January 20, 2025

Note: The Linux build is currently not working, we are investigating the issue.

471969: Fixes an issue with data export in combination with filter configurations.
430844: Fixes an inconsistency in Attestation History when an approver is defined in multiple sublevels.
470581: Fixes an issue with delegation missing in the attestation cases approval process for the Chief Approval Team.
474717: Fixes issues with clicking on Mitigating Controls tab in policy details cause.
472678: Fixes an issue with initial filter definitions
470994: Fixes some UX issues on the Attestation runs page.
465262: Fixes issues with the package-log.json.
454186: Hides statistics with missing data.
474772: Adds sorting of entries in the history view.
466611: Fixes an issue with preselected product bundles.
472739: Fixes issues with the Data Explorer menu structure if the user lacks permissions.
459188: Fixes an issue with the attestor filter on the Attestation history page.
443363: Fixes an issue with synchronizing entities in case of an error.
469777: Fixes empty validation massages on the Operation support portal's Operation history page.
465328: Fixes an issue with additional columns on tables.
468193: Fixes an issue with re-assigning direct, single responsibilities of the Responsibilities of My Reports page.
470449: Fixes product image sizes in the Product selection side sheet.
473445: Fixes an issue with switching identities on the Profile page.
470722: Fixes the view of rule violations with SAP functions.
453126: Fixes an issue with false property binding on bulk editors.
472698: Fixes an issue with the search control on the data source toolbar.
470472: Adds an indication to the product bundle page when there is no data.
447722: Fixes an issue which caused the details of a pending attestation case to change erroneously.
468592: Fixes an issue with occurring error loops while picking an additional approver.
470706: Fixes issues with the grouping on the My Responsibilities page when using the toggle button.
460921: Fixes issues with the history view on the My Responsibilities/Data Explorer page.
470603: Fixes the layout of the Password Reset Portal login page.
474716: Fixes an issue regarding a wrong data source, when filtering on the Request New Membership side sheet.
468855: Fixes validation issues on the Delegation page.


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
| `rmb` | Angular plugin library | `qbm`, `qer`                      |
| `rms` | Angular plugin library | `qbm`, `qer`                      |
| `rps` | Angular plugin library | `qbm`, `qer`                      |
| `sac` | Angular plugin library | `qbm`, `qer`                      |
| `aad` | Angular plugin library | `qbm`, `qer`, `tsb`               |
| `apc` | Angular plugin library | `qbm`, `qer`                      |
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

## Dependencies

Identity Manager 9.3 is based on Angular 18.

Verify that you have installed a compatible `node.js` version. The version used by the CI build is defined in the [`.github/workflows/npm-build.yml`](.github/workflows/npm-build.yml) file in the `node-version` property. Other versions of `node.js`, including newer versions, are not guaranteed to be compatible with other Angular versions. Please see the [version compatibility table](https://v18.angular.dev/reference/versions) on the official Angular site.

## Debugging

Running and debugging web applications is possible using the default tools of the Angular CLI toolchain. For example, you can use `ng serve qer-app-portal` to debug the Portal app.

You will need an API Server instance that the web applications will connect to. You can host an API Server locally for development purposes. Run the following command on the command line:

```
imxclient.exe run-apiserver -B
```

The web apps will connect to the API Server using the URL defined in the application's `environment.ts` file. The default setting is `http://localhost:8182` which is the default URL that a local API Server will run on.

## Documentation

Please refer to the [HTML Development Guide](https://support.oneidentity.com/technical-documents/identity-manager/9.3/html5-development-guide) for step-by-step instructions on getting started, building and deploying applications.

This repository also contains component-based documentation. There are two ways to install this documentation locally. The result will be stored in _\imxweb\documentation\<projectname>_.

### 1. Using Compodoc (preferred)

1. Install the Compodoc package globally by running `npm install -g @compodoc/compodoc`.
2. Navigate to the library to create documentation for (e.g. `imxweb\projects\qer`).
3. Run `compodoc -p tsconfig.lib.json` for a library or `compodoc -p tsconfig.app.json` for an application.

### 2. Using npm only

This method only works for `qbm`, `qer` and the applications.

1. Navigate to _imxweb_.
2. run `npm run doc:<projectname>`

## Additional resources

- [Theming guide](./imxweb/custom-theme/readme.md)
- [CDR guide](./imxweb/projects/qbm/src/lib/cdr/Readme.md)
- [API Plugin Development](https://github.com/OneIdentity/IdentityManager.ApiSdk)

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
