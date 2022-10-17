# custom-app

This package contains the base functionality that you can use as a starting point to build a custom application.

This package has a dependency on the `qbm` package, so make sure that package is compiled using the `ng build qbm` command.

## App service

The [`app.service.ts`](./src/app/app.service.ts) service is responsible for initialization of the app:

- It configures the API client with the correct URL for the API Server.
- It configures the translation service with the browser's preferred language setting.
- It shows a splash screen while the application is being loaded.

## Routing

The [`appconfig.json`](./src/appconfig.json) file sets two default routes:

``` json
  "routeConfig": {
    "login": "",
    "start": "start"
  }
```

The `login` route is the route called when there is no authenticated session.
The `start` route is the route called when there is an authenticated session.

These routes are defined in the [`app-routing.module.ts`](./src/app/app-routing.module.ts) file. Add any routes for your application here.

## Login component

The app re-uses the default [login component](../qbm/src/lib/login/login.component.ts) defined in the `qbm` library.

This app uses a session on the `portal` API project; you can change this setting in the [`environment.ts`](./src/environments/environment.ts) file.

## Page layout

The [`app.component.html`](./src/app/app.component.html) file defines the basic layout of the page. This template makes use of the following base components:

- `<imx-mast-head>` shows the mast head including:
  - the product logo,
  - the name of the authenticated user,
  - an option to log out,
  - and the "about" dialog.
- `<imx-usermessage>` is the container where error messages are shown.

The app component also shows a splash screen while the application is being initialized.

## Debugging

Run `ng serve custom-app` to serve the custom app.
