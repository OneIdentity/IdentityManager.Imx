**One Identity open source projects are supported through [One Identity GitHub issues](https://github.com/OneIdentity/IdentityManager.Imx/issues) and the [One Identity Community](https://www.oneidentity.com/community/). This includes all scripts, plugins, SDKs, modules, code snippets or other solutions. For assistance with any One Identity GitHub project, please raise a new Issue on the [One Identity GitHub project](https://github.com/OneIdentity/IdentityManager.Imx/issues) page. You may also visit the [One Identity Community](https://www.oneidentity.com/community/) to ask questions.  Requests for assistance made through official One Identity Support will be referred back to GitHub and the One Identity Community forums where those requests can benefit all users.**

# Identity Manager HTML5 applications

## Change log

### December 7, 2023
- The repository has been updated with the newest source code.
- Mainly fixes for filtering issues added.
- Fixes on the Operation Support portal added.

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

