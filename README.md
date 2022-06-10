**One Identity open source projects are supported through [One Identity GitHub issues](https://github.com/OneIdentity/IdentityManager.Imx/issues) and the [One Identity Community](https://www.oneidentity.com/community/). This includes all scripts, plugins, SDKs, modules, code snippets or other solutions. For assistance with any One Identity GitHub project, please raise a new Issue on the [One Identity GitHub project](https://github.com/OneIdentity/IdentityManager.Imx/issues) page. You may also visit the [One Identity Community](https://www.oneidentity.com/community/) to ask questions.  Requests for assistance made through official One Identity Support will be referred back to GitHub and the One Identity Community forums where those requests can benefit all users.**

# Identity Manager HTML5 applications

## Change log

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

*Note*: A case-insensitive file system (Windows) is currently required to build the projects. Compatibility with case-sensitive file systems is coming soon.

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
|`aad`|Angular plugin library|`qbm`, `qer`, `tsb`|
|`aob`|Angular plugin library|`qbm`, `qer`|
|`uci`|Angular plugin library|`qbm`, `qer`|
|`cpl`|Angular plugin library|`qbm`, `qer`|
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
|`arc-app-certaccess`|Starling CertAccess|Angular app|various|

## Building

To install the required dependencies, run `npm install` in the root folder of the workspace.

To build any library or app, run `npm build <name>`. Note that you must build each library in the correct order; along with any plugins that you want to include. For example, to build `qer-app-portal`, you need to build at least the following in this order:
- `qbm`
- `qer`
- `qer-app-portal`

## Customizing libraries

When changing the code of a _library_, you will need to build and deploy customized versions of all the apps that should use the customized versions. For example, changing `qer` will require that you also compile `qer-app-portal`, `qer-app-operationssupport` and `qer-app-pwdportal` because all of these apps include `qbm`.

When changing the code of a _plugin library_, you will need to build and deploy customized versions of the plugin library itself, and all plugin libraries depending on it. For example, changing `tsb` will require that you also compile `aad` and `o3t` because these plugins include `tsb`.

_Note_: Starling CertAccess currently does not support hosting custom HTML5 apps.

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

|Branch|Product version|
|-|-|
|`v82`|Identity Manager 8.2.x|
|`master`|The `master` branch does not correspond to a supported version of Identity Manager. Do not use this branch for development purposes.|

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

