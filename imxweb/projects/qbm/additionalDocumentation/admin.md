# Administration

The Administration Portal consists of the following main components:

- The [`DashboardComponent`](../src/lib/admin/dashboard.component.ts) defines the homepage.
- The [`StatusComponent`](../src/lib/admin/status.component.ts) shows the list of API projects.
- The [`ConfigComponent`](../src/lib/admin/config.component.ts) provides the API configuration.
- The [`PackagesComponent`](../src/lib/admin/packages.component.ts) shows the list of available packages.
- The [`PluginsComponent`](../src/lib/admin/plugins.component.ts) shows the list of loaded API plugins.
- The [`CacheComponent`](../src/lib/admin/cache.component.ts) shows the cache status.
- The [`LogsComponent`](../src/lib/admin/logs.component.ts) provides access to the server logs.
- The [`SwaggerComponent`](../src/lib/admin/swagger/swagger.component.ts) wraps the API documentation component.

## Authentication

The login itself is handled by the [`AuthenticationService`](../src/lib/authentication/authentication.service.ts). The UI component for authentication is provided by the [`LoginComponent`](../src/lib/login/login.component.ts).

To check whether the user is currently logged in, there is a special [route guard](../src/lib/authentication/authentication-guard.service.ts) to redirect the user to the login component if a login is required. An older way of doing this is using the [`imx_SessionService`](../src/lib/session/imx-session.service.ts).
