# Data sets

In this section you can find information about components that are designed to display data sets. These cover both flat lists and hierarchical data structures.

## Data source toolbar

The [`DataSourceToolbarComponent`](../src/lib/data-source-toolbar/data-source-toolbar.component.ts) is used to handle the interaction between the data source and the actual view.
It is defined in the [`DataSourceToolbarModule`](../src/lib/data-source-toolbar/data-source-toolbar.module.ts) together with other components that are used inside the toolbar.

The following features are available:

- Filtering
- Searching
- Grouping
- Sorting
- Export and configuration of the view

The definition of values and functions for these features is defined using the [`DataSourceToolbarSettings`](../src/lib/data-source-toolbar/data-source-toolbar-settings.ts) interface.

## Paginator

The [`DataSourcePaginatorComponent`](../src/lib/data-source-toolbar/data-source-paginator.component.ts) is used to paginate the data. This is done by updating the navigation state of the associated [`DataSourceToolbarComponent`](../src/lib/data-source-toolbar/data-source-toolbar.component.ts). The usage of a paginator is optional.

## View components

### Data table

The [`DataTableComponent`](../src/lib/data-table/data-table.component.ts) is the most commonly used view component for the web applications.

This component renders an Angular Material table with columns that can be defined by using other components. These are defined in the [`DataTableModule`](../src/lib/data-table/data-table.module.ts), as well as the data table itself.

### Data tiles

The [`DataTilesComponent`](../src/lib/data-tiles/data-tiles.component.ts) can be used to render a tile view which displays a [`DataTileComponent`](../src/lib/data-tiles/data-tile.component.ts) for each element in the data source. Both components are part of the [`DataTileModule`](../src/lib/data-tiles/data-tiles.module.ts), but only the [`DataTilesComponent`](../src/lib/data-tiles/data-tiles.component.ts) is exported.

### Data tree

The [`DataTreeComponent`](../src/lib/data-tree/data-tree.component.ts) can be used to display hierarchical data. Other than the data table, it uses a special data source, that can be defined by extending the abstract [`TreeDatabase`](../src/lib/data-tree/tree-database.ts) class. The data tree is part of the [`DataTreeModule`](../src/lib/data-tree/data-tree.module.ts) along with other components that can be used with the data tree, such as the [`DataTreeSearchResultsComponent`](../src/lib/data-tree/data-tree-search-results/data-tree-search-results.component.ts). This component shows a flat view of an entry subset, because a parameter such as a filter or a search string narrows the result.

If you prefer to use a data tree with a data source toolbar functionality, there is the [`DataTreeWrapperComponent`](../src/lib/data-tree-wrapper/data-tree-wrapper.component.ts) defined in the [`DataTreeWrapperModule`](../src/lib/data-tree-wrapper/data-tree-wrapper.module.ts). This component combines a data tree with a data source toolbar so that the user can search and filter the tree.

### Ordered list component

NOTE: This component is not compatible with the data source toolbar.

The [`OrderedListComponent`](../src/lib/ordered-list/ordered-list.component.ts) can be used to display a simple list of `<Name, Value>` entries. It is defined in the [`OrderedListModule`](../src/lib/ordered-list/ordered-list.module.ts).

## Related components

The following components are related to listings.

### Selected elements

Because all view component can contain a multi-select feature, it is possible to select only some items. To check which elements are selected across pages, the [`SelectedElementsComponent`](../src/lib/selected-elements/selected-elements.component.ts) can be used. This component shows how many elements are selected and, when clicked, opens a side sheet with all selected elements in a table.

### Foreign key picker

The following foreign key picker dialogs are available.

#### Normal picker

The classic data picker is defined inside the [`FkAdvancedPickerComponent`](../src/lib/fk-advanced-picker/fk-advanced-picker.component.ts). It contains a [`FkSelectorComponent`](../src/lib/fk-advanced-picker/fk-selector.component.ts) that could be used on other components as well.

##### Hierarchical picker

The hierarchical picker is defined in the [`FkHierarchicalDialogComponent`](../src/lib/fk-hierarchical-dialog/fk-hierarchical-dialog.component.ts) and displays the data in a searchable tree.
