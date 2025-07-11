# Working with data tables

A frequently recurring task is the representation of data in tables. The IMX QBM library offers components that facilitate the visualization of data and take the special IMX data structure into account.

Data tables offer a lot of configuration possibilities. This example shows you the most important ones.

The two most important modules in this context are `data-view-source` (projects\qbm\src\lib\data-view\data-view-source.ts) and `data-view-auto-table` (projects\qbm\src\lib\data-view\data-view-auto-table\data-view-auto-table.component.ts).
The `data-view-source` service contains all the base logic. and the `data-view-auto-table` component represents the table.

The basic structure consists of three elements:

- the data view toolbar (optional)
- the data view auto table
- the data view paginator (optional)

![Basic Structure](../../compodoc\assets\images\new_data_table\1-basic-stucture.png)

In addition to the ability to search, group, filter, and so on, the toolbar contains a data source component that is used by the data table and the paginator to display data and move within the data set.
The toolbar and the paginator component are optional.
The "Hello World" version of the data table component looks like this.

```html
<imx-data-view-toolbar [dataSource]="dataSource"></imx-data-view-toolbar>
<imx-data-view-auto-table [dataSource]="dataSource"></imx-data-view-auto-table>
<imx-data-view-paginator [dataSource]="dataSource"></imx-data-view-paginator>
```

```ts
@Component({
  selector: 'imx-table-example',
  templateUrl: './table-example.component.html',
  providers: [DataViewSource],
})
export class TableExmapleComponent implements OnInit {
  public entitySchema: EntitySchema;

  constructor(
    private readonly identityService: IdentitiesService,
    public dataSource: DataViewSource<PortalPersonAll>,
  ) {
    this.entitySchema = this.identityService.personAllSchema;
  }

  public async ngOnInit(): Promise<void> {
    const dataViewInitParameters: DataViewInitParameters<PortalPersonAll> = {
      execute: async (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalPersonAll>> =>
        this.identityService.getAllPerson(params, signal),
      schema: this.entitySchema,
      columnsToDisplay: [
        this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
        this.entitySchema.Columns.DefaultEmailAddress,
        this.entitySchema.Columns.UID_Locality,
        this.entitySchema.Columns.UID_Department,
      ],
    };
    this.dataSource.init(dataViewInitParameters);
  }
}
```

Every component need one instance of the DataViewSource service, because the data stored in the service, that's why add the service to the component providers.
The DataViewSource service also needs to be injected in the constructor. The service is generic, so the data type could be modified.
To load the data and setup all the required component, the init function have to be called.
In the DataViewInitParameters interface the `execute` function, the `schema` and the `columnsToDisplay` array property are required.
On intialization and in every pagination, filter, search or sort event the execute function will be called.
If we want to manually refresh the data table, the DataViewSource `updateState` function have to call.
The `columnsToDisplay` defines which columns the table should display.

The table now shows four fields that are rendered automatically. It is also possible to design columns manually. Whether the table is rendered automatically or manually is controlled by the `mode` input field.
`mode` can take two values: `auto` and `manual`. The default value of the `mode` input field is `auto`. In manual mode all the columns should

Table with manually configured columns:

```html
<imx-data-view-auto-table [dataSource]="dataSource" mode="manual">
  <ng-container [matColumnDef]="DisplayColumns.DISPLAY_PROPERTYNAME">
    <th mat-header-cell *matHeaderCellDef>{{ entitySchema?.Columns?.[DisplayColumns.DISPLAY_PROPERTYNAME]?.Display }}</th>
    <td mat-cell *matCellDef="let item" role="gridcell" class="imx-table-cell">
      <div>{{ item.GetEntity().GetDisplay() }}</div>
      <div subtitle>{{ item.DefaultEmailAddress.Column.GetDisplayValue() }}</div>
    </td>
  </ng-container>
  <ng-container [matColumnDef]="entitySchema.Columns.XMarkedForDeletion.ColumnName">
    <th mat-header-cell *matHeaderCellDef>{{ entitySchema?.Columns?.XMarkedForDeletion?.Display }}</th>
    <td mat-cell *matCellDef="let item" role="gridcell">
      <div *ngIf="item.XMarkedForDeletion.value !== 0">
        <eui-badge color="gray">{{ item.XMarkedForDeletion.Column.GetDisplayValue() }}</eui-badge>
      </div>
    </td>
  </ng-container>
</imx-data-view-auto-table>
```

All of the columns declared in the `columnsToDisplay` array needs a column definition in the template also.

```ts
const dataViewInitParameters: DataViewInitParameters<PortalPersonAll> = {
  execute: async (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalPersonAll>> =>
    this.identityService.getAllPerson(params, signal),
  schema: this.entitySchema,
  columnsToDisplay: [this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME], this.entitySchema.Columns.XMarkedForDeletion],
};
```

To enable the sorting the `dataModel` property in the DataViewInitParameters is necessary. A table with `manual` mode the `matSort` directive, the `matSortChange` output property and the `matSortActive`, `matSortDirection` input properties have to be setted.
Also in the sortabe columns the header cells need the `mat-sort-header` directive:

```html
<imx-data-view-auto-table
  [dataSource]="dataSource"
  mode="manual"
  matSort
  (matSortChange)="dataSource?.sortChange($event)"
  [matSortActive]="dataSource.sortId()"
  [matSortDirection]="dataSource.sortDirection()"
>
  <ng-container [matColumnDef]="entitySchema.Columns.DescriptionHotline.ColumnName">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ entitySchema?.Columns?.DescriptionHotline?.Display }}</th>
    <td mat-cell *matCellDef="let item" role="gridcell">
      <div class="imx-table-column-ellipsis" title="{{ getTicketItemValue(item, 'DescriptionHotline') }}">
        {{ getTicketItemValue(item, 'DescriptionHotline') }}
      </div>
    </td>
  </ng-container>
  <ng-container [matColumnDef]="entitySchema.Columns.ActionHotline.ColumnName">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ entitySchema?.Columns?.ActionHotline?.Display }}</th>
    <td mat-cell *matCellDef="let item" role="gridcell">
      <div class="imx-table-column-ellipsis" title="{{ getTicketItemValue(item, 'ActionHotline') }}">
        {{ getTicketItemValue(item, 'ActionHotline') }}
      </div>
    </td>
  </ng-container>
</imx-data-view-auto-table>
```

To handles the row click action the `highlightEntity` property is responsible in the DataViewInitParameters interface.
To use the table row checkbox selection the `selectable` boolean typed input property for the `imx-data-view-auto-table` element has to be true.
The `selectionChange` property in the DataViewInitParameters interface handle the selection changes.
The `imx-data-view-selection` component shows the state of the selection and gives useful tools to handles selection, like show only the selected items or deselect all.

![Table with selection](../../compodoc\assets\images\new_data_table\2-table-selection.png)

```html
<mat-card>
  <imx-data-view-toolbar [dataSource]="dataSource" [showSettings]="false"></imx-data-view-toolbar>
  <imx-data-view-auto-table
    [dataSource]="dataSource"
    mode="manual"
    matSort
    (matSortChange)="dataSource?.sortChange($event)"
    [matSortActive]="dataSource.sortId()"
    [selectable]="true"
  >
    ...
  </imx-data-view-auto-table>
  <imx-data-view-paginator [dataSource]="dataSource"></imx-data-view-paginator>
</mat-card>
<div class="imx-button-bar-transparent">
  <imx-data-view-selection [dataSource]="dataSource"></imx-data-view-selection>
  ...
</div>
```
