# Data sets
In this section you can find information about components that are designed to display data sets. These cover both flat lists and hierarchical data structures.

## Data source toolbar
The [`DataSourceToolbarComponent`](../../components/DataSourceToolbarComponent.html) is used to handle the interaction between the data source and the actual view.
It is defined in the [`DataSourceToolbarModule`](../../modules/DataSourceToolbarModule.html) together with other components that are used inside the toolbar.

The following features are available:
- Filtering
- Searching
- Grouping
- Sorting
- Export and configuration of the view

The definition of values and functions for these features is defined using the [`DataSourceToolbarSettings`](../../interfaces/DataSourceToolbarSettings.html) interface.


## Paginator
The [`DataSourcePaginatorComponent`](../../components/DataSourcePaginatorComponent.html) is used to paginate the data. This is done by updating the navigation state of the associated [`DataSourceToolbarComponent`](../../components/DataSourceToolbarComponent.html). The usage of a paginator is optional.

## View components

### Data table
The [`DataTableComponent`](../../components/DataTableComponent.html) is the most commonly used view component for the web applications. 

This component renders an Angular Material table with columns that can be defined by using other components. These are defined in the [`DataTableModule`](../../modules/DataTableModule.html), as well as the data table itself.

### Data tiles
The [`DataTilesComponent`](../../components/DataTilesComponent.html) can be used to render a tile view which displays a [`DataTileComponent`](../../components/DataTileComponent.html) for each element in the data source. Both components are part of the [`DataTileModule`](../../modules/DataTilesModule.html), but only the [`DataTilesComponent`](../../components/DataTilesComponent.html) is exported.

### Data tree
The [`DataTreeComponent`](../../components/DataTreeComponent.html) can be used to display hierarchical data. Other than the data table, it uses a special data source, that can be defined by extending the abstract [`TreeDatabase`](../../classes/TreeDatabase.html) class. The data tree is part of the [`DataTreeModule`](../../modules/DataTreeModule.html) along with other components that can be used with the data tree, such as the [`DataTreeSearchResultsComponent`](../../components/DataTreeSearchResultsComponent.html). This component shows a flat view of an entry subset, because a parameter such as a filter or a search string narrows the result.

If you prefer to use a data tree with a data source toolbar functionality, there is the [`DataTreeWrapperComponent`](../../components/DataTreeWrapperComponent.html) defined in the [`DataTreeWrapperModule`](../../modules/DataTreeWrapperModule.html). This component combines a data tree with a data source toolbar so that the user can search and filter the tree.

### Select component
NOTE: This component is not compatible with the data source toolbar.

The [`SelectComponent`](../../components/SelectComponent.html) can be used to show a list of entries using an autocomplete control. It is defined in the [`SelectModule`](../../modules/SelectModule.html).

### Ordered list component
NOTE: This component is not compatible with the data source toolbar.

The [`OrderedListComponent`](../../components/OrderedListComponent.html) can be used to display a simple list of `<Name, Value>` entries. It is defined in the [`OrderedListModule`](../../modules/OrderedListModule.html).

## Related components
The following components are related to listings.

### Selected elements
Because all view component can contain a multi-select feature, it is possible to select only some items. To check which elements are selected across pages, the [`SelectedElementsComponent`](../../) can be used. This component shows how many elements are selected and, when clicked, opens a side sheet with all selected elements in a table.

### Foreign key picker
The following foreign key picker dialogs are available.

#### Normal picker
The classic data picker is defined inside the [`FkAdvancedPickerComponent`](../../components/FkAdvancedPickerComponent.html). It contains a [`FkSelectorComponent`](../../components/FkSelectorComponent.html) that could be used on other components as well.

##### Hierarchical picker
The hierarchical picker is defined in the [`FkHierarchicalDialogComponent`](../../components/FkHierarchicalDialogComponent.html) and displays the data in a searchable tree.