# Identity management

In this section you can find information about components that support identity management use cases.

## 1. Identity management

The identity management is defined in the [`DataExplorerIdentitiesComponent`](../components/DataExplorerIdentitiesComponent.html) and can be used in different contexts:
- as a manager ("My Responsibilities" page)
- as an identity administrator (Data Explorer)

The manager view only shows identities, that the user is responsible for, while the admin view shows all identities in the system.

Clicking an identity opens a side sheet that displays more information about the identity.

This library defines the following sub components that are part of this side sheet:
- a tab control with the following sub components:
  - [`ObjectHyperviewComponent`](../components/ObjectHyperviewComponent.html): Displays a hyperview for the identity.
  - [`OrgChartComponent`](../components/OrgChartComponent.html): Displays an organizational chart for the identity.
  - [`ObjectHistoryComponent`](../../qbm/components/ObjectHistoryComponent.html): Displays the history of the identity object. This is defined in QBM.
  - [`AssignmentsComponent`](../components/AssignmentsComponent.html): Displays the memberships of the selected entity.
- Additionally, it is possible to register other tabs using the [`ExtService`](../../qbm/injectables/ExtService.html), which is part of the QBM library.


## 2. Address book
The [`AddressbookComponent`](../components/AddressbookComponent.html) lists all identities from the `Person` database table. It is a read-only view that opens a read-only side sheet.

## 3. Profile
The [`ProfileComponent`](../components/ProfileComponent.html) provides access to the current user's main data. Additionally users can configure email subscriptions ([`MailSubscriptionsComponent`](../components/MailSubscriptionsComponent.html)), manage
security keys ([`SecurityKeysComponent`](../components/SecurityKeysComponent.html)) and manage their password questions ([`PasswordQueryComponent`](../components/PasswordQueryComponent.html)).

To extend the profile with more tabs, register them with the [`ExtService`](../../qbm/injectables/ExtService.html), which is part of the QBM library.

## 4. User model
The user model is defined in the [`UserModelService`](../injectables/UserModelService.html). It contains functions to fetch the current session's configuration, including information on available program features, pending requests, and direct reports.
