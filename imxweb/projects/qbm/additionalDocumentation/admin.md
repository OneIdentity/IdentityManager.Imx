# Administration

The Administration Portal consists of the following main components:

- The [`DashboardComponent`](../../components/DashboardComponent.html) defines the homepage.
- The [`StatusComponent`](../../components/StatusComponent.html) shows the list of API projects.
- The [`ConfigComponent`](../../components/ConfigComponent.html) provides the API configuration.
- The [`PackagesComponent`](../../components/PackagesComponent.html) shows the list of available packages. 
- The [`PluginsComponent`](../../components/PluginsComponent.html) shows the list of loaded API plugins.
- The [`CacheComponent`](../../components/CacheComponent.html) shows the cache status.
- The [`LogsComponent`](../../components/LogsComponent.html) provides access to the server logs.
- The [`SwaggerComponent`](../../components/SwaggerComponent.html) wraps the API documentation component.

## Authentication

The login itself is handled by the [`AuthenticationService`](../../injectables/AuthenticationService.html). The UI component for authentication is provided by the [`LoginComponent`](../../components/LoginComponent.html).

To check whether the user is currently logged in, there is a special [route guard](../../guards/AuthenticationGuardService.html) to redirect the user to the login component if a login is required. An older way of doing this is using the [`imx_SessionService`](../../injectables/imx_SessionService.html).