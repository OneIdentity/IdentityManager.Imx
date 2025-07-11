# Role management

The [role management module](../src/lib/role-management/role-manangement.module.ts) extends the Data Explorer with components for the following object types:

- departments
- cost centers
- locations
- application roles
- resources
- multi requestable/unsubscribable resources
- multi-request resources
- assignment resources

The UI uses the [`RolesOverviewComponent`](../src/lib/role-management/roles-overview/roles-overview.component.ts) for roles and the [`ResourcesComponent`](../src/lib/resources/resources.component.ts) for resources.

Each role can be edited inside a [`RoleDetailComponent`](../src/lib/role-management/role-detail/role-detail.component.ts) or [`ResourceSidesheetComponent`](../src/lib/resources/resource-sidesheet/resource-sidesheet.component.ts).

## Extending Data Explorer

It is possible to define plugins to extend the view for more role types. A [`RoleObjectInfo`](../src/lib/role-management/role-object-info.ts) object needs to be registered on a [`RoleService`](../src/lib/role-management/role.service.ts) that can be injected to the constructor of a plugin.
