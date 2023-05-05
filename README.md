**One Identity open source projects are supported through [One Identity GitHub issues](https://github.com/OneIdentity/IdentityManager.Imx/issues) and the [One Identity Community](https://www.oneidentity.com/community/). This includes all scripts, plugins, SDKs, modules, code snippets or other solutions. For assistance with any One Identity GitHub project, please raise a new Issue on the [One Identity GitHub project](https://github.com/OneIdentity/IdentityManager.Imx/issues) page. You may also visit the [One Identity Community](https://www.oneidentity.com/community/) to ask questions.  Requests for assistance made through official One Identity Support will be referred back to GitHub and the One Identity Community forums where those requests can benefit all users.**

# Identity Manager HTML5 applications

## Change log

### May 5, 2023

The `v82` branch has been updated with fixes for the following issues:

- 410170: Fixed accessibility of cards on the dashboard
- 35861: Avoid unnecessary reload after approving an attestation case
- 36835 / 416107: Fixed error when showing department memberships in the Data Explorer
- 36837 / 416492: Fixed redundant API calls for pending items
- 36716 / 416493: Fixed redundant API calls in the service catalog

### March 28, 2023

The `v82` branch has been updated with fixes for the following issues:

- 358311 / 36090: Copy of some attestation policies yields error
- 332087 / 36360: OAuth redirect flow was broken on the Server Administration app
- 324128 / 35979 / 36503: Memberships of system roles were not displayed
- 386166 / 36530: Package links were broken in the Server Administration app
- 305110 / 36715: Error message after saving an invalid membership condition
- 393701: Cannot select a previously selected image for a service item
- 36325: Direct/indirect reports of an identity were not being fetched correctly. (This supports a bug fix in the API Server component.)

### January 16, 2023

The `v82` branch has been updated with fixes for the following issues:

- 36325 The view of a manager's reports was not handling indirect vs. direct reports correctly.
- 387104 Some context menu panels were opening on the wrong side, causing line breaks.

### December 12, 2022

The `v82` branch has been updated with fixes for the following issues:

- 36288 Fix assertion error by moving code from constructor to OnInit method in `imxweb/projects/qbm/src/lib/user-message/user-message.component.ts`.
- 387119 Some tiles on the dashboard were overlapping on smaller resolutions.
- 393025 An error occurred when GetDataModel was undefined.

### November 17, 2022

The `v82` branch has been updated with fixes for the following issues:

- 36011 Identity administrators cannot change main data for identities.
- 36016 Changing the application title causes the dashboard link to fail.
- 36143 Candidate objects for parameter objects sometimes do not get reloaded.
- 35988 Reports cannot be subscribed if "PDF" is not included in the list of valid values.

### September 14, 2022

The `v82` branch has been updated with fixes for the following issues:

- 35898 A partial shopping cart cannot be submitted, so the submit button is deactivated when the user makes a partial selection
- 35818 The shopping cart items now show the cart item display and not the service item display
- 314557 Added an unsaved changes check in the dynamic role editor
- 320800 The menu item "Move to shopping cart" is shown disabled when no items are selected
- 304748 Error messages sometimes were sometimes displayed only after an additional click
- 308454/308947 Fixed small UI glitches in the Operations Support Portal

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
|`aad`|Angular plugin library|`qbm`, `qer`, `tsb`|
|`aob`|Angular plugin library|`qbm`, `qer`|
|`uci`|Angular plugin library|`qbm`, `qer`|
|`cpl`|Angular plugin library|`qbm`, `qer`|
|`dpr`|Angular plugin library|`qbm`|
|`o3t`|Angular plugin library|`qbm`, `qer`, `tsb`|
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

## Hosting in Identity Manager

Follow these steps to host a package (such as `Html_qer-app-portal.zip`) in Identity Manager:

- Download the build artefact package(s).
- Start Software Loader.
- Move the package into a subdirectory named `custom`.
- Connect to the Identity Manager database.
- Select "Upload files".
- Select the `custom\Html_qer-app-portal.zip` file.
- Assign the file to the API Server machine role.

When a client makes a request for the URL `/html/qer-app-portal`, the API Server will look the following files in this order, using the first file which exists.
1. `imxweb/custom/Html_qer-app-portal.zip`
1. `imxweb/Html_qer-app-portal.zip`


_Note_: The API Server adds support for customized packages with the 8.2.1 release.

## Adding a plugin library

Plugins are Angular libraries that are loaded dynamically at runtime. The set of plugins is managed by the API Server. Plugins are discovered by looking for files named `imx-plugin-config.json` in the program directory.

This sample file declares that the plugin library `ccc` should be loaded in the `qer-app-portal` app. The name of the Angular module to instantiate is `CustomConfigModule`.

``` json
{
  "qer-app-portal": [
      {
          "Container": "ccc",
          "Name": "CustomConfigModule"
      }
  ]
}
```

## Branches and Update Policy

The following table shows the branches in this repository corresponding to each product version.

|Branch|Product version|
|-|-|
|`master` / `v82`|Identity Manager 8.2.x|

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

