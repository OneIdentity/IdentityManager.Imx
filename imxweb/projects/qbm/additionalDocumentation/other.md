# Other reusable components and services

In this section you can find information about components that are intended for reuse in other libraries and applications and are not covered by the other sections.

## Bulk editor

The [`BulkPropertyEditorComponent`](../src/lib/bulk-property-editor/bulk-property-editor.component.ts) is used to edit the same list properties for multiple objects. Each [`BulkItemComponent`](../src/lib/bulk-property-editor/bulk-item/bulk-item.component.ts) has its own list of [`CdrEditorComponents`](../src/lib/cdr/cdr-editor/cdr-editor.component.ts).

## Busy indicator

The [BusyIndicatorComponent](../src/lib/busy-indicator/busy-indicator.component.ts) can be used to display a loading spinner and a predefined text. For example, you can use it together with a [`BusyService`](../src/lib/base/busy.service.ts) that indicates if something has started/ended loading.

## Charts

In the web applications, charts are rendered using the `ElementalUiChartComponent`. Some configurations are defined by related classes:

- [`LineChartOptions`](../src/lib/chart-options/line-chart-options.ts) defines a line chart definition.
- [`SeriesInformation`](../src/lib/chart-options/series-information.ts) defines one series in a line chart.
- [`XAxisInformation`](../src/lib/chart-options/x-axis-information.ts) and [`YAxisInformation`](../src/lib/chart-options/y-axis-information.ts) define the information for the line axis.

Additionally, the [`ChartTileComponent`](../src/lib/chart-tile/chart-tile.component.ts) can be used to render a chart as part of a tile.

## Custom theme

The [`CustomThemeService`](../src/lib/custom-theme/custom-theme.service.ts) can be used to load all defined themes. It is also used to add the themes to the `<head>` part of the page.

## Dynamic components

Sometimes it is necessary to add a component, that is not defined as part of a static module, but as part of a dynamic module. To display this component, a [`ExtComponent`](../src/lib/ext/ext.component.ts) or a [`ExtService`](../src/lib/ext/ext.service.ts) can be used. It is part of the [`ExtModule`](../src/lib/ext/ext.module.ts), together with the needed service and a directive.

## File selector

If the user should be able to upload files, the [FileSelectorService](../src/lib/file-selector/file-selector.service.ts) can be used.

## Hyperview

A hyperview is a graph that visualizes the relationships of an object to other objects and links them. The [`HyperviewComponent`](../src/lib/hyperview/hyperview.component.ts) and its parts are part of the [`HyperviewModule`](../src/lib/hyperview/hyperview.module.ts).

## Masthead

In the header (i.e. the `masthead`), information like the company logo, a help icon or the user menu can be displayed. It is defined inside the [`MastHeadComponent`](../src/lib/mast-head/mast-head.component.ts), that is part of the ['MastHeadModule'](../src/lib/mast-head/mast-head.module.ts).

The [`MastHeadComponent`](../src/lib/mast-head/mast-head.component.ts) is also responsible for the menu bar. The menu bar is rendered using an `ElementalUiTopNavigationComponent`. The menu items can be defined by using the [`MenuService`](../src/lib/menu/menu.service.ts).

## Object history

The [`ObjectHistoryComponent`](../src/lib/object-history/object-history.component.ts) can be used to show the history of an object. It can be displayed as a table or by using a [`TimelineComponent`](../src/lib/timeline/timeline.component.ts).

## Side navigation

The [`SideNavigationViewComponent`](../src/lib/side-navigation-view/side-navigation-view.component.ts) is used to display a vertical menu that can be part of a page or another component. It can collapse for smaller screens.
The [`SideNavigationViewComponent`](../src/lib/side-navigation-view/side-navigation-view.component.ts) is part of the [`SideNavigationViewModule`](../src/lib/side-navigation-view/side-navigation-view.module.ts).

Another way of displaying a side navigation is the [`SidenavTreeComponent`](../src/lib/sidenav-tree/sidenav-tree.component.ts) which uses a tree view inside a collapsible panel.

## SQL Wizard

The [`SqlWizardComponent`](../src/lib/sqlwizard/sqlwizard.component.ts) can be used to filter the result of a larger amount of entries. It creates a filter expression that can be used as part of a normal API call. The SQL Wizard is defined in the [`SqlWizardModule`](../src/lib/sqlwizard/sqlwizard.module.ts) together with the sub components, that are used to build the filter.

To use a [`SqlWizardComponent`](../src/lib/sqlwizard/sqlwizard.component.ts) as part of the table filter in a custom project, the abstract class [`SqlWizardApiService`](../src/lib/sqlwizard/sqlwizard-api.service.ts) has to be extended and added as a provider.
