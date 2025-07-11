# IT Shop

## New request

The starting point of the request lifecycle is defined by the [`NewRequestComponent`](../src/lib/new-request/new-request.component.ts). This component consists of several tabs:

1. [`NewRequestProductComponent`](../src/lib/new-request/new-request-product/new-request-product.component.ts): Shows the products by service category.
2. [`NewRequestPeerGroupComponent`](../src/lib/new-request/new-request-peer-group/new-request-peer-group.component.ts): Shows recommended products and organizational structures.
3. [`NewRequestReferenceUserComponent`](../src/lib/new-request/new-request-reference-user/new-request-reference-user.component.ts): Shows service items and organizational structures of a specific reference user.
4. [`NewRequestProductBundleComponent`](../src/lib/new-request/new-request-product-bundle/new-request-product-bundle.component.ts): Shows product bundles and their products. Users can request individual products from product bundles or whole product bundles.

## Parameter editor

Service items can define request properties. These are handled using the [`CartItemInteractiveService`](../src/lib/shopping-cart/cart-item-edit/cart-item-interactive.service.ts), which converts the data given by the server to editable parameter columns, that can be edited using the [`CartItemEditComponent`](../src/lib/shopping-cart/cart-item-edit/cart-item-edit.component.ts).

## Shopping cart

The entry point into the shopping cart is defined by the [`ShoppingCartComponent`](../src/lib/shopping-cart/shopping-cart.component.ts). It contains a table that lists the products in the shopping cart. The products can be edited, removed and checked for validity. All sub components and services are part of the [`ShoppingCartModule`](../src/lib/shopping-cart/shopping-cart.module.ts).
Products in the shopping cart can be moved to the Saved for Later list and vice versa. This is handled by the [`ShoppingCartForLaterComponent`](../src/lib/shopping-cart/shopping-cart-for-later/shopping-cart-for-later.component.ts).

## Pending requests

The next step in the workflow is the approval of requests. The entry point for this is the [`ApprovalsComponent`](../src/lib/itshopapprove/approvals.component.ts), which lists all requests that can currently be approved by the user.

This also contains a sub component [`InquiriesComponent`](../src/lib/itshopapprove/inquiries/inquiries.component.ts) which lists request inquiries for the user.

All the sub components are part of the [`ApprovalsModule`](../src/lib/itshopapprove/approvals.module.ts) which includes the components on the corresponding side sheet.

## Request history

All requests visible for the current user are displayed by the [`RequestHistoryComponent`](../src/lib/request-history/request-history.component.ts). The actions that the user can perform for these requests are implemented in the [`RequestActionService`](../src/lib/request-history/request-history.service.ts).

## Archived requests

Archived requests are requests that have been moved to the history database. These can be viewed using the [`ArchivedRequestsComponent`](../src/lib/archived-requests/archived-requests.component.ts).

## Editors for items

### Product bundles

Product bundles can be edited using the [`ItshopPatternComponent`](../src/lib/itshop-pattern/itshop-pattern.component.ts), defined in the [`ItshopPatternModule`](../src/lib/itshop-pattern/itshop-pattern.module.ts).

### Service categories

The [`ServiceCategoriesModule`](../src/lib/service-categories/service-categories.module.ts) contains the [`ServiceCategoriesComponent`](../src/lib/service-categories/service-categories.component.ts). This component uses a [`DataTreeWrapperComponent`](../../qbm/src/lib/data-tree-wrapper/data-tree-wrapper.component.ts) to show the service category structure of the IT Shop.

### Service items

The service item functionality is part of the [`ServiceItemsEditModule`](../src/lib/service-items-edit/service-items-edit.module.ts). The entry point for this component is the [`ServiceItemsEditComponent`](../src/lib/service-items-edit/service-items-edit.component.ts) which lists all available service items. Clicking on an item opens a [`ServiceItemsEditSidesheetComponent`](../src/lib/service-items-edit/service-items-edit-sidesheet/service-items-edit-sidesheet.component.ts).

### Approval workflow editor

The approval workflow editor is part of the [`ApprovalWorkFlowModule`](../src/lib/approval-workflows/approval-workflows.module.ts). The entry point is the [`ApprovalWorkflowHomeComponent`](../src/lib/approval-workflows/approval-workflow-home/approval-workflow-home.component.ts).

The editing functionality is implemented in the [`ApprovalWorkflowEditComponent`](../src/lib/approval-workflows/approval-workflow-edit/approval-workflow-edit.component.ts),
