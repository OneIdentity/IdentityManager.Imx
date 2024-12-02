# IT Shop

## New request
The starting point of the request lifecycle is defined by the [`NewRequestComponent`](../components/NewRequestComponent.html). This component consists of several tabs:

1. [`NewRequestProductComponent`](../components/NewRequestProductComponent.html): Shows the products by service category.
2. [`NewRequestPeerGroupComponent`](../components/NewRequestPeerGroupComponent.html): Shows recommended products and organizational structures.
3. [`NewRequestReferenceUserComponent`](../components/NewRequestReferenceUserComponent.html): Shows service items and organizational structures of a specific reference user.
4. [`NewRequestProductBundleComponent`](../components/NewRequestProductBundleComponent.html): Shows product bundles and their products. Users can request individual products from product bundles or whole product bundles.

## Parameter editor

Service items can define request properties. These are handled using the [`ParameterDataService`](../injectables/ParameterDataService.html), which converts the data given by the server to editable parameter columns, that can be edited using the [`CartItemEditComponent`](../components/CartItemEditComponent.html).

## Shopping cart
The entry point into the shopping cart is defined by the [`ShoppingCartComponent`](../components/ShoppingCartComponent.html). It contains a table that lists the products in the shopping cart. The products can be edited, removed and checked for validity. All sub components and services are part of the [`ShoppingCartModule`](../modules/ShoppingCartModule.html).
Products in the shopping cart can be moved to the Saved for Later list and vice versa. This is handled by the [`ShoppingCartForLaterComponent`](../components/ShoppingCartForLaterComponent.html).

## Pending requests

The next step in the workflow is the approval of requests. The entry point for this is the [`ApprovalsComponent`](../components/ApprovalsComponent.html), which lists all requests that can currently be approved by the user.

This also contains a sub component [`InquiriesComponent`](../components/InquiriesComponent.html) which lists request inquiries for the user.

All the sub components are part of the [`ApprovalsModule`](../modules/ApprovalsModule.html) which includes the components on the corresponding side sheet.

## Request history

All requests visible for the current user are displayed by the [`RequestHistoryComponent`](../components/RequestHistoryComponent.html). The actions that the user can perform for these requests are implemented in the [`RequestActionService`](../injectables/RequestActionService.html).

## Archived requests

Archived requests are requests that have been moved to the history database. These can be viewed using the [`ArchivedRequestsComponent`](../components/ArchivedRequestsComponent.html).

## Editors for items

### Product bundles

Product bundles can be edited using the [`ItshopPatternComponent`](../components/ItshopPatternComponent.html), defined in the [`ItshopPatternModule`](../modules/ItshopPatternModule.html).

### Service categories

The [`ServiceCategoriesModule`](../modules/ServiceCategoriesModule.html) contains the [`ServiceCategoriesComponent`](../components/ServiceCategoriesComponent.html). This component uses a [`DataTreeWrapperComponent`](../../qbm/components/DataTreeWrapperComponent.html) to show the service category structure of the IT Shop.

### Service items

The service item functionality is part of the [`ServiceItemsEditModule`](../modules/ServiceItemsEditModule.html). The entry point for this component is the [`ServiceItemsEditComponent`](../components/ServiceItemsEditComponent.html) which lists all available service items. Clicking on an item opens a [`ServiceItemsEditSidesheetComponent`](../components/ServiceItemsEditSidesheetComponent.html).

### Approval workflow editor

The approval workflow editor is part of the [`ApprovalWorkFlowModule`](../modules/ApprovalWorkFlowModule.html). The entry point is the [`ApprovalWorkflowHomeComponent`](../components/ApprovalWorkflowHomeComponent.html).

The editing functionality is implemented in the [`ApprovalWorkflowEditComponent`](../components/ApprovalWorkflowEditComponent.html),