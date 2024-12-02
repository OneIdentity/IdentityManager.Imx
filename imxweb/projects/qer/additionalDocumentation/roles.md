# Role management

The [role management module](../modules/RoleManangementModule.html) extends the Data Explorer with components for the following object types:

- departments
- cost centers
- locations
- application roles
- resources
- multi requestable/unsubscribable resources
- multi-request resources
- assignment resources

The UI uses the [`RolesOverviewComponent`](../components/RolesOverviewComponent.html) for roles and the [`ResourcesComponent`](../components/ResourcesComponent.html) for resources.

Each role can be edited inside a [`RoleDetailComponent`](../components/RoleDetailComponent.html) or  [`ResourceSidesheetComponent`](../components/ResourceSidesheetComponent.html).

## Extending Data Explorer

It is possible to define plugins to extend the view for more role types. A [`RoleObjectInfo`](../interfaces/RoleObjectInfo.html) object needs to be registered on a [`RoleService`](../injectables/RoleService.html) that can be injected to the constructor of a plugin.
