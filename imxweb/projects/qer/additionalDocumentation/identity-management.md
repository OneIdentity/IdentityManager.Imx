# Identity management

In this section you can find information about components that support identity management use cases.

## 1. Identity management

The identity management is defined in the [`DataExplorerIdentitiesComponent`](../src/lib//data-explorer-view/data-explorer-view.component.ts) and can be used in different contexts:

- as a manager ("My Responsibilities" page)
- as an identity administrator (Data Explorer)

The manager view only shows identities, that the user is responsible for, while the admin view shows all identities in the system.

Clicking an identity opens a side sheet that displays more information about the identity.

This library defines the following sub components that are part of this side sheet:

- a tab control with the following sub components:
  - [`ObjectHyperviewComponent`](../src/lib/object-hyperview//object-hyperview.component.ts): Displays a hyperview for the identity.
  - [`OrgChartComponent`](../src/lib/org-chart/org-chart.component.ts): Displays an organizational chart for the identity.
  - [`ObjectHistoryComponent`](../../qbm/src/lib/object-history/object-history.component.ts): Displays the history of the identity object. This is defined in QBM.
  - [`AssignmentsComponent`](../src/lib/identities/identity-sidesheet/assignments/assignments.component.ts): Displays the memberships of the selected entity.
- Additionally, it is possible to register other tabs using the [`ExtService`](../../qbm/src/lib/ext/ext.service.ts), which is part of the QBM library.

## 2. Address book

The [`AddressbookComponent`](../src/lib/addressbook/addressbook.component.ts) lists all identities from the `Person` database table. It is a read-only view that opens a read-only side sheet.

## 3. Profile

The [`ProfileComponent`](../src/lib/profile/profile.component.ts) provides access to the current user's main data. Additionally users can configure email subscriptions ([`MailSubscriptionsComponent`](../src/lib/profile/mailsubscriptions.component.ts)), manage
security keys ([`SecurityKeysComponent`](../src/lib/profile/security-keys/security-keys.component.ts)) and manage their password questions ([`PasswordQueryComponent`](../src/lib/password-questions/password-questions.component.ts)).

To extend the profile with more tabs, register them with the [`ExtService`](../../qbm/injectables/ExtService.ts), which is part of the QBM library.

## 4. User model

The user model is defined in the [`UserModelService`](../src/lib/user/user-model.service.ts). It contains functions to fetch the current session's configuration, including information on available program features, pending requests, and direct reports.
