# Working with data tables

A frequently recurring task is the representation of data in tables. The IMX QBM library offers components that facilitate the visualization of data and take the special IMX data structure into account.

Data tables offer a lot of configuration possibilities. This example shows you the most important ones.

The two most important modules in this context are `data-source-toolbar` (projects\qbm\src\lib\data-source-toolbar) and `data-table` (projects\qbm\src\lib\data-table).

The basic structure consists of three elements:
- the data source toolbar
- the actual table
- a paginator

![overall Structure](../../assets/images/data_table/1-overall-structure.png)

In addition to the ability to search, filter, and so on, the data source toolbar contains a data source component that is used by the data table and the paginator to display data and move within the data set. The data source toolbar is a link between the data table and the paginator.

The "Hello World" version of the data table component looks like this.

``` html
<h1 class="mat-headline">{{ '#LDS#Identities' | translate }}</h1>

<imx-data-source-toolbar
  #dst
  [settings]="dstSettings"
  (navigationStateChanged)="onNavigationStateChanged($event)"
></imx-data-source-toolbar>

<imx-data-table
  [dst]="dst"
  mode="auto"
>
</imx-data-table>

<imx-data-source-paginator [dst]="dst"></imx-data-source-paginator>
```

``` ts

@Component({
  selector: 'imx-select-identity',
  templateUrl: './select-identity.component.html',
  styleUrls: ['./select-identity.component.scss'],
})
export class SelectIdentityComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public readonly schema: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public navigationState: CollectionLoadParameters = { PageSize: 20 };

  private displayedColumns: IClientProperty[] = [];

  constructor(private readonly qerApiClient: QerApiService) {
    this.schema = this.qerApiClient.typedClient.PortalPersonAll.GetSchema();
    this.displayedColumns = [
      this.schema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.schema.Columns.DefaultEmailAddress
    ];
  }

  public async ngOnInit(): Promise<void> {
    await this.navigate();
  }

  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  private async navigate(): Promise<void> {
    const data = await this.qerApiClient.typedClient.PortalPersonAll.Get(this.navigationState);

    this.dstSettings = {
      displayedColumns: this.displayedColumns,
      dataSource: data,
      entitySchema: this.schema,
      navigationState: this.navigationState,
    };
  }
}

```

The minimum set of properties that must be specified are `EntitySchema`, `DisplayColumns` and `CollectionLoadParameters`. 

The following parts of the .ts Datei are important.

``` ts
 this.displayedColumns = [
      this.schema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.schema.Columns.DefaultEmailAddress
    ];
```

`displayedColumns` defines which columns the table should display.

``` ts
  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }
```

This event handler is called every time the state of the data changes, for example when the user navigates to the next page.

``` ts
 private async navigate(): Promise<void> {
    const data = await this.qerApiClient.typedClient.PortalPersonAll.Get(this.navigationState);

    this.dstSettings = {
      displayedColumns: this.displayedColumns,
      dataSource: data,
      entitySchema: this.schema,
      navigationState: this.navigationState,
    };
  }
```
The `navigate()` method retrieves data from the API Server. The actual request is made by calling the API client (`this.qerApiClient.typedClient.PortalPersonAll.Get(this.navigationState)`). The concept of API clients is described in another example.

The first version of the component looks like this.

![First Version](../../assets/images/data_table/2-first-version.png)

## Designing the table

The table now shows two fields that are rendered automatically. It is also possible to design columns manually. Whether the table is rendered automatically or manually is controlled by the `mode` input field.

``` html
<imx-data-table
  [dst]="dst"
  mode="auto"
>
</imx-data-table>
```

`mode` can take two values: `auto` and `manual`. 

To display the table in manual mode, the two columns must be added to the html template.

``` html
<imx-data-table [dst]="dst" mode="manual">
  <imx-data-table-column [entityColumn]="schema?.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]">
    <ng-template let-item>
      <div>{{ item.GetEntity().GetDisplay() }}</div>
    </ng-template>
  </imx-data-table-column>
  <imx-data-table-column [entityColumn]="schema?.Columns.DefaultEmailAddress">
    <ng-template let-item>
      <div>{{ item.DefaultEmailAddress.Column.GetDisplayValue() }}</div>
    </ng-template>
  </imx-data-table-column>
</imx-data-table>
```
The first column currently shows the default display name of the object. A second row that indicates whether the person is a primary identity or not is added.

``` html
<imx-data-table [dst]="dst" mode="manual">
  <imx-data-table-column [entityColumn]="schema?.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]">
    <ng-template let-item>
      <div>{{ item.GetEntity().GetDisplay() }}</div>
      <div>{{ item.IdentityType.Column.GetDisplayValue() }}</div>
    </ng-template>
  </imx-data-table-column>
  <imx-data-table-column [entityColumn]="schema?.Columns.DefaultEmailAddress">
    <ng-template let-item>
      <div>{{ item.DefaultEmailAddress.Column.GetDisplayValue() }}</div>
    </ng-template>
  </imx-data-table-column>
</imx-data-table>
```

In the following, a third column that contains a button is added. To display data of an object, the table uses the `<imx-data-table-column>` tag. To display other types of elements, such as buttons, the `<imx-data-table-generic-column>` tag is used.
Before the button can be displayed, the new column must be added to the columns to be displayed. This is done in the `*.ts` file.

``` ts
 this.displayedColumns = [
      this.schema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.schema.Columns.DefaultEmailAddress,
      {
        ColumnName: 'viewDetailsButton',
        Type: ValType.String
      }
    ];
```


``` html
<imx-data-table [dst]="dst" mode="manual">
  <imx-data-table-column [entityColumn]="schema?.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]">
    <ng-template let-item>
      <div>{{ item.GetEntity().GetDisplay() }}</div>
      <div>{{ item.IdentityType.Column.GetDisplayValue() }}</div>
    </ng-template>
  </imx-data-table-column>
  <imx-data-table-column [entityColumn]="schema?.Columns.DefaultEmailAddress">
    <ng-template let-item>
      <div>{{ item.DefaultEmailAddress.Column.GetDisplayValue() }}</div>
    </ng-template>
  </imx-data-table-column>
  <imx-data-table-generic-column columnName="viewDetailsButton">
    <ng-template>
      <button mat-button color="primary">
        {{ '#LDS#Details' | translate }}
      </button>
    </ng-template>
  </imx-data-table-generic-column>
</imx-data-table>
```

The final result looks like this.

![Version with buttons](../../assets/images/data_table/4-table-with-buttons.png)

## Adding search

To add a search bar, the `search` option must be enabled and a method that processes the output of the `search` output parameter must be implemented. 

The following code snippets shows these changes.

> Code
``` html
<imx-data-source-toolbar
  #dst
  [settings]="dstSettings"
  (navigationStateChanged)="onNavigationStateChanged($event)"
  [options]="['search']"
  (search)="onSearch($event)"
></imx-data-source-toolbar>
```

> Code
``` ts
  public async onSearch(keywords: string): Promise<void> {
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }
```


![Version with search enabled](../../assets/images/data_table/3-table-with-search-enabled.png)
