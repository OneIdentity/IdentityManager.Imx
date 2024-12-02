# Other components and services

In this section you can find information about the most important components in the `qer` library.

## Data Explorer\My responsibilities

The [`DataExplorerViewComponent`](../components/DataExplorerViewComponent.html) and the [`MyResponsibilitiesViewComponent`](../components/MyResponsibilitiesViewComponent.html) are used to display the main component for the  _Data administration_ > _Data Explorer_ and the _Responsibilities_ > _My Responsibilities_ pages. It shows a menu item for each object type registered in the [`DataExplorerRegistryService`](../injectables/DataExplorerRegistryService.html) or the [`MyResponsibilitiesRegistryService`](../injectables/MyResponsibilitiesRegistryService.html) respectively.

## Delegation

The [`DelegationComponent`](../components/DelegationComponent.html) implements the delegation functionality. The component uses a `MatStepper` to navigate through the steps.

## Related applications

The [`RelatedApplicationsComponent`](../components/RelatedApplicationsComponent.html) adds links to other websites to the navigation. These links are configured in the database table `RelatedApplication`.

## Risk index

The [`RiskConfigComponent`](../components/RiskConfigComponent.html) displays a table of all risk index functions. They can be edited by using the [`RiskConfigSidesheetComponent`](../components/RiskConfigSidesheetComponent.html).

## Source detective
The [`SourceDetectiveComponent`](../components/SourceDetectiveComponent.html) shows the assignment analysis of an object. It contains a tree with branches for every assignment.

## Statistics
The [`StatisticsModule`](../modules/StatisticsModule.html) contains the components for the _Statistics_ page. The entry point is the [`StatisticsHomePageComponent`](../components/StatisticsHomePageComponent.html). Statistics are organized into *areas* which are displayed in a navigation tree. The user can view the statistics for each area. Clicking on a statistic opens a [`ChartsSidesheetComponent`](../components/ChartsSidesheetComponent.html) or a [`HeatmapSidesheetComponent`](../components/HeatmapSidesheetComponent.html) for a heatmap statistic.

## Terms of use

The [`TermsOfUseListComponent`](../components/TermsOfUseListComponent.html) handles the user flow to accept the terms of use for a product. It also includes step-up 2FA if configured.

## User process

The [`UserProcessComponent`](../components/UserProcessComponent.html) displays a list of all the processes associated with the current user.
