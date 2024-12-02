# Other reusable components and services
In this section you can find information about components that are intended for reuse in other libraries and applications and are not covered by the other sections.

## Bulk editor
The [`BulkPropertyEditorComponent`](../../components/BulkPropertyEditorComponent.html) is used to edit the same list properties for multiple objects. Each [`BulkItemComponent`](../../components/BulkItemComponent.html) has its own list of [`CdrEditorComponents`](../../components/CdrEditorComponent.html).

## Busy indicator
The [BusyIndicatorComponent](../../components/BusyIndicatorComponent.html) can be used to display a loading spinner and a predefined text. For example, you can use it together with a [`BusyService`](../../injectables/BusyService.html) that indicates if something has started/ended loading.

## Charts
In the web applications, charts are rendered using the `ElementalUiChartComponent`. Some configurations are defined by related classes:
- [`LineChartOptions`](../../classes/LineChartOptions.html) defines a line chart definition.
- [`SeriesInformation`](../../classes/SeriesInformation.html) defines one series in a line chart.
- [`XAxisInformation`](../../classes/XAxisInformation.html) and [`YAxisInformation`](classes/YAxisInformation.html) define the information for the line axis.

Additionally, the [`ChartTileComponent`](../../components/ChartTileComponent.html) can be used to render a chart as part of a tile.

## Custom theme
The [`CustomThemeService`](../../injectables/CustomThemeService.html) can be used to load all defined themes. It is also used to add the themes to the `<head>` part of the page.

## Dynamic tabs
Some tabs in side sheets have to be added dynamically because they are part of a dynamic module. The item is defined by a new [`TabItem`](../../interfaces/TabItem.html) and can be added to a tab control using a [`DynamicTabDataProviderDirective`](../../directives/DynamicTabDataProviderDirective.html).

## Extensions
Sometimes it is necessary to add a component, that is not defined as part of a static module, but as part of a dynamic module. To display this component, a [`ExtComponent`](../../components/ExtComponent.html) can be used. It is part of the [`ExtModule`](../../modules/ExtModule.html), together with the needed service and a directive.

## File selector
If the user should be able to upload files, the [FileSelectorService](../../injectables/FileSelectorService.html) can be used.

## Hyperview
A hyperview is a graph that visualizes the relationships of an object to other objects and links them. The [`HyperviewComponent`](../../components/HyperviewComponent.html) and its parts are part of the [`HyperviewModule`](../../modules/HyperViewModule.html).

## Masthead
In the header (i.e. the `masthead`), information like the company logo, a help icon or the user menu can be displayed. It is defined inside the [`MastHeadComponent`](../../components/MastHeadComponent.html), that is part of the ['MastHeadModule'](../../modules/MastHeadModule.html).

The [`MastHeadComponent`](../../components/MastHeadComponent.html) is also responsible for the menu bar. The menu bar is rendered using an `ElementalUiTopNavigationComponent`. The menu items can be defined by using the [`MenuService`](../../injectables/MenuService.html).

## Object history
The [`ObjectHistoryComponent`](../../components/ObjectHistoryComponent.html) can be used to show the history of an object. It can be displayed as a table or by using a [`TimelineComponent`](../../components/TimelineComponent.html).

## Side navigation
The [`SideNavigationViewComponent`](../../components/SideNavigationViewComponent.html) is used to display a vertical menu that can be part of a page or another component. It can collapse for smaller screens.

Another way of displaying a side navigation is the [`SidenavTreeComponent`](../../components/SidenavTreeComponent.html) which uses a tree view inside a collapsible panel.

 The [`SideNavigationViewComponent`](../../components/SideNavigationViewComponent.html) is part of the [`SideNavigationViewModule`](../../modules/SideNavigationViewModule.html) while the [`SidenavTreeComponent`](../../components/SidenavTreeComponent.html) is part of the [`SidenavTreeModule`](../../modules/SidenavTreeModule.html).

## SQL Wizard
The [`SqlWizardComponent`](../../components/SqlWizardComponent.html) can be used to filter the result of a larger amount of entries. It creates a filter expression that can be used as part of a normal API call. The SQL Wizard is defined in the [`SqlWizardModule`](../../modules/SqlWizardModule.html) together with the sub components, that are used to build the filter.

To use a [`SqlWizardComponent`](../../components/SqlWizardComponent.html) as part of the table filter in a custom project, the abstract class [`SqlWizardApiService`](../../classes/SqlWizardApiService.html) has to be extended and added as a provider.