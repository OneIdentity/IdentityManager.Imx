# Other components and services

In this section you can find information about the most important components in the `qer` library.

## Data Explorer\My responsibilities

The [`DataExplorerViewComponent`](../src/lib/data-explorer-view/data-explorer-view.component.ts) and the [`MyResponsibilitiesViewComponent`](../src/lib/my-responsibilities-view/my-responsibilities-view.component.ts) are used to display the main component for the _Data administration_ > _Data Explorer_ and the _Responsibilities_ > _My Responsibilities_ pages. It shows a menu item for each object type registered in the [`DataExplorerRegistryService`](../src/lib/data-explorer-view/data-explorer-registry.service.ts) or the [`MyResponsibilitiesRegistryService`](../src/lib/my-responsibilities-view/my-responsibilities-registry.service.ts) respectively.

## Delegation

The [`DelegationComponent`](../src/lib/delegation/delegation.component.ts) implements the delegation functionality. The component uses a `MatStepper` to navigate through the steps.

## Related applications

The [`RelatedApplicationsComponent`](../src/lib/related-applications/related-applications.component.ts) adds links to other websites to the navigation. These links are configured in the database table `RelatedApplication`.

## Risk index

The [`RiskConfigComponent`](../src/lib/risk-config/risk-config.component.ts) displays a table of all risk index functions. They can be edited by using the [`RiskConfigSidesheetComponent`](../src/lib/risk-config/risk-config-sidesheet/risk-config-sidesheet.component.ts).

## Source detective

The [`SourceDetectiveComponent`](../src/lib/sourcedetective/sourcedetective.component.ts) shows the assignment analysis of an object. It contains a tree with branches for every assignment.

## Statistics

The [`StatisticsModule`](../src/lib/statistics/statistics.module.ts) contains the components for the _Statistics_ page. The entry point is the [`StatisticsHomePageComponent`](../src/lib/statistics/statistics-home-page/statistics-home-page.component.ts). Statistics are organized into _areas_ which are displayed in a navigation tree. The user can view the statistics for each area. Clicking on a statistic opens a [`ChartsSidesheetComponent`](../src/lib/statistics/charts/charts-sidesheet/charts-sidesheet.component.ts) or a [`HeatmapSidesheetComponent`](../src/lib/statistics/heatmaps/heatmap-sidesheet/heatmap-sidesheet.component.ts) for a heatmap statistic.

## Terms of use

The [`TermsOfUseListComponent`](../src/lib/terms-of-use/terms-of-use-list.component.ts) handles the user flow to accept the terms of use for a product. It also includes step-up 2FA if configured.

## User process

The [`UserProcessComponent`](../src/lib/user-process/user-process.component.ts) displays a list of all the processes associated with the current user.
