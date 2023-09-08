/*
 * ONE IDENTITY LLC. PROPRIETARY INFORMATION
 *
 * This software is confidential.  One Identity, LLC. or one of its affiliates or
 * subsidiaries, has supplied this software to you under terms of a
 * license agreement, nondisclosure agreement or both.
 *
 * You may not copy, disclose, or use this software except in accordance with
 * those terms.
 *
 *
 * Copyright 2023 One Identity LLC.
 * ALL RIGHTS RESERVED.
 *
 * ONE IDENTITY LLC. MAKES NO REPRESENTATIONS OR
 * WARRANTIES ABOUT THE SUITABILITY OF THE SOFTWARE,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, OR
 * NON-INFRINGEMENT.  ONE IDENTITY LLC. SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING
 * THIS SOFTWARE OR ITS DERIVATIVES.
 *
 */

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { DependencyToConfirm, OpsupportNamespaces, OpsupportOutstandingTables, OutstandingAction, OutstandingObject } from 'imx-api-dpr';
import {
  CollectionLoadParameters,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  ReadOnlyEntity,
  TypedEntityCollectionData,
  ValType,
} from 'imx-qbm-dbts';
import { ConfirmationService, DataSourceToolbarSettings, SnackBarService } from 'qbm';
import { DependenciesComponent } from './dependencies.component';
import { OutstandingObjectEntity } from './outstanding-object-entity';
import { OutstandingService } from './outstanding.service';
import { SelectedItemsComponent } from './selected-items/selected-items.component';

@Component({
  templateUrl: './outstanding.component.html',
  styleUrls: ['./outstanding.component.scss'],
})
export class OutstandingComponent implements OnInit {
  public namespaces: OpsupportNamespaces[] = [];
  public selectedNamespace: OpsupportNamespaces;
  public navigationState: CollectionLoadParameters = {};
  public dstSettings: DataSourceToolbarSettings;

  public tabledata: OpsupportOutstandingTables[] = [];
  public selectedTable: OpsupportOutstandingTables;

  public showHelper = true;
  public bulk = true;
  public selected: OutstandingObjectEntity[] = [];

  public schema: EntitySchema;
  public busyLoadingTable = false;
  public loadingTableData = false;
  public showAllData = false;
  public tableDataCount: number = 0;

  public LdsOutstandingText =
    '#LDS#Objects which do not exist in the target system are marked as outstanding. Here you can get an overview of outstanding objects, delete these objects in the database or add these objects to the target system again. Additionally, you can reset the status of these objects so that they are no longer marked as outstanding.';

  private ldsPublishable: string;
  private ldsActionFilter: string;
  private ldsDeletable: string;
  private currentFilterValue: string;

  constructor(
    private readonly apiService: OutstandingService,
    private readonly translator: TranslateService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly confirmationService: ConfirmationService,
    private readonly snackbar: SnackBarService,
    private readonly translate: TranslateService,
    private readonly busyService: EuiLoadingService
  ) {}

  public busy = false;

  public async ngOnInit(): Promise<void> {
    this.busy = true;
    try {
      this.ldsPublishable = await this.translator.get('#LDS#Addable objects').toPromise();
      this.ldsDeletable = await this.translator.get('#LDS#Deletable objects').toPromise();
      this.ldsActionFilter = await this.translator.get('#LDS#Performable actions').toPromise();

      this.schema = await this.buildEntitySchema();
      this.buildDstSettings({ Data: [], totalCount: 0 });
      const typed = await this.apiService.getNamespaces();
      this.namespaces = typed.Data;
    } finally {
      this.busy = false;
    }
  }

  public async tableSelected(table: OpsupportOutstandingTables): Promise<void> {
    this.selectedTable = table;
    this.selected = [];
    this.showAllData = false;
    await this.navigate();
  }

  public async optionSelected(newNamespace: OpsupportNamespaces): Promise<void> {
    this.selectedNamespace = newNamespace;
    this.tabledata = [];
    this.selectedTable = null;
    this.selected = [];
    this.tableDataCount = 0;
    this.showAllData = false;
    this.buildDstSettings({ Data: [], totalCount: 0 });
    if (newNamespace) {
      this.loadingTableData = true;
      try {
        this.tabledata = (await this.apiService.getTableData(newNamespace)).Data
          // remove tables without outstanding objects
          .filter((m) => m.CountOutstanding.value > 0)
          // count outstanding objects
          .map((table => {
            this.tableDataCount += table.CountOutstanding.value;
            return table;
          }));
      } finally {
        this.loadingTableData = false;
      }
    }
  }
  public async onShowAllData(): Promise<void> {
    if (this.showAllData && (!!this.selectedTable || this.dstSettings.dataSource.totalCount === 0)) {
      this.confirmationService
        .confirm({
          Title: '#LDS#Heading Show All Outstanding Objects',
          Message: '#LDS#Displaying all outstanding objects may take some time. Are you sure you want to display all outstanding objects?',
          identifier: 'outstanding-objects-show-all-data',
        })
        .then((res) => {
          if (res) {
            this.selectedTable = null;
            this.navigate();
          } else {
            this.showAllData = false;
          }
        });
    } else {
      this.buildDstSettings({ Data: [], totalCount: 0 });
    }
  }

  public selectionChanged(selected: OutstandingObjectEntity[]): void {
    this.selected = selected;
  }

  public async getData(newState: CollectionLoadParameters): Promise<void> {
    this.navigationState = newState;
    await this.navigate();
  }

  public onHelperDismissed(): void {
    this.showHelper = false;
  }

  public async showSelected(objects: OutstandingObjectEntity[]): Promise<void> {
    this.sidesheet.open(SelectedItemsComponent, {
      title: await this.translate.get('#LDS#Heading Selected Items').toPromise(),
      padding: '0',
      width: 'max(550px, 55%)',
      data: { objects, schema: this.schema },
      testId: 'outstanding-objects-selected-elements-sidesheet',
    });
  }

  public async confirmDependencies(action: OutstandingAction): Promise<boolean> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    let dependencies: DependencyToConfirm[];
    try {
      dependencies = await this.apiService.getDependencies(
        action,
        this.selected.map((m) => m.ObjectKey.value)
      );
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }

    // no dependencies? don't show confirmation dialog
    if (dependencies.length === 0) {
      return true;
    }

    const sidesheetRef = this.sidesheet.open(DependenciesComponent, {
      title: await this.translator.get('#LDS#Heading View Dependencies').toPromise(),
      subTitle: this.selected.length === 1 ? this.selected[0].GetEntity().GetDisplay() : '',
      padding: '0px',
      width: 'max(600px, 55%)',
      testId: 'outstanding-view-depedencies-sidesheet',
      data: {
        dependencies,
        action,
      },
    });
    const fromsidesheet = await sidesheetRef.afterClosed().toPromise();
    return fromsidesheet;
  }

  public canPublishAllSelected(): boolean {
    return this.selected.every((elem) => elem.CanPublish.value);
  }

  public canDeleteAllSelected(): boolean {
    return this.selected.every((elem) => elem.CanDelete.value);
  }

  public deleteObjects(): Promise<void> {
    return this.processWithConfirmation(OutstandingAction.Delete);
  }

  public resetObjects(): Promise<void> {
    return this.processWithConfirmation(OutstandingAction.DeleteState);
  }

  public publishObjects(): Promise<void> {
    return this.processWithConfirmation(OutstandingAction.Publish);
  }

  public getNoDataText(): string {
    return this.selectedNamespace
      ? this.tabledata.length > 0
        ? '#LDS#Select an object type.'
        : '#LDS#There are currently no outstanding objects.'
      : '#LDS#Select a target system.';
  }

  private buildDstSettings(data: TypedEntityCollectionData<OutstandingObjectEntity>): void {
    this.dstSettings = {
      navigationState: {},
      dataSource: data,
      entitySchema: this.schema,
      filters: [
        {
          Description: this.ldsActionFilter,
          Name: 'actionfilter',
          Options: [
            {
              Display: this.ldsPublishable,
              Value: 'publishable',
            },
            {
              Display: this.ldsDeletable,
              Value: 'deletable',
            },
          ],
          CurrentValue: this.currentFilterValue,
          Delimiter: ',',
        },
      ],
      displayedColumns: [this.schema.Columns.Display, this.schema.Columns.LastLogEntry],
    };
  }

  private async navigate(): Promise<void> {
    try {
      this.busyLoadingTable = true;

      await this.navigateWithoutBusy();
    } finally {
      this.busyLoadingTable = false;
    }
  }

  private async navigateWithoutBusy(): Promise<void> {
    if (!this.selectedNamespace) {
      this.buildDstSettings({ Data: [], totalCount: 0 });
    }

    let baseObjects: OutstandingObject[];
    this.currentFilterValue = this.navigationState.actionfilter;
    if (this.selectedTable) {
      baseObjects = await this.apiService.getOutstandingTable(
        this.selectedTable.TableName.value,
        this.selectedNamespace.Ident_DPRNameSpace.value,
        this.currentFilterValue
      );
    } else {
      baseObjects = await this.apiService.getOutstandingNamespace(
        this.selectedNamespace.Ident_DPRNameSpace.value,
        this.currentFilterValue
      );
    }

    const reduce: (input: string[]) => string = (m) => {
      if (!m || m.length == 0) return null;
      return m.reduce((p, v) => p + ' ' + v);
    };
    const typedEntities = baseObjects.map(
      (obj) =>
        new OutstandingObjectEntity(
          new ReadOnlyEntity(this.dstSettings.entitySchema, {
            Keys: [obj.ObjectKey],
            Columns: {
              ObjectKey: {
                Value: obj.ObjectKey,
              },
              CanDelete: {
                Value: obj.CanDelete,
              },
              CanPublish: {
                Value: obj.CanPublish,
              },
              CanDeleteRestrictionReason: {
                Value: reduce(obj.CanDeleteRestrictionReasons),
              },
              CanPublishRestrictionReason: {
                Value: reduce(obj.CanPublishRestrictionReasons),
              },
              Display: {
                Value: obj.Display,
              },
              LastLogEntry: {
                Value: obj.LastLogEntry,
              },
              ObjectType: {
                Value: obj.ObjectType,
              },
              LastMethodRun: {
                Value: obj.LastMethodRun,
              },
            },
          })
        )
    );
    this.buildDstSettings({
      Data: typedEntities,
      totalCount: typedEntities.length,
    });
  }

  private async processWithConfirmation(action: OutstandingAction): Promise<void> {
    let canProceed = await this.confirmationService.confirm({
      Title: this.getConfirmationTitle(action),
      Message: this.getConfirmationText(action),
      identifier: 'outstanding-objects-process-confirmation',
    });

    if (!canProceed) {
      return;
    }

    canProceed = await this.confirmDependencies(action);
    if (!canProceed) {
      return;
    }
    return this.process(action);
  }

  private async process(action: OutstandingAction): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      await this.apiService.processObjects(
        action,
        this.bulk,
        this.selected.map((k) => k.ObjectKey.value)
      );
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
      this.snackbar.open({ key: this.getSnackbarText(action) });
    }

    // reload
    return this.navigate();
  }

  private getConfirmationTitle(action: OutstandingAction): string {
    switch (action) {
      case OutstandingAction.Delete:
        return this.selected.length > 1 ? '#LDS#Heading Delete Objects' : '#LDS#Heading Delete Object';
      case OutstandingAction.DeleteState:
        return this.selected.length > 1 ? '#LDS#Heading Reset Objects' : '#LDS#Heading Reset Object';
      case OutstandingAction.Publish:
        return this.selected.length > 1 ? '#LDS#Heading Add Objects' : '#LDS#Heading Add Object';
    }
  }

  private getConfirmationText(action: OutstandingAction): string {
    switch (action) {
      case OutstandingAction.Delete:
        return this.selected.length > 1
          ? '#LDS#Are you sure you want to delete the selected objects in the database?'
          : '#LDS#Are you sure you want to delete the selected object in the database?';
      case OutstandingAction.DeleteState:
        return this.selected.length > 1
          ? '#LDS#Are you sure you want to remove the Outstanding labels for the selected objects?'
          : '#LDS#Are you sure you want to remove the Outstanding label for the selected object?';
      case OutstandingAction.Publish:
        return this.selected.length > 1
          ? '#LDS#Are you sure you want to add the selected objects to the target system?'
          : '#LDS#Are you sure you want to add the selected object to the target system?';
    }
  }

  private getSnackbarText(action: OutstandingAction): string {
    switch (action) {
      case OutstandingAction.Delete:
        return this.selected.length > 1
          ? '#LDS#The objects have been successfully deleted in the database.'
          : '#LDS#The object has been successfully deleted in the database.';
      case OutstandingAction.DeleteState:
        return this.selected.length > 1
          ? '#LDS#The Outstanding labels have been successfully removed for the objects.'
          : '#LDS#The Outstanding label has been successfully removed for the object.';
      case OutstandingAction.Publish:
        return this.selected.length > 1
          ? '#LDS#The objects have been successfully added to the target system.'
          : '#LDS#The object has been successfully added to the target system.';
    }
  }

  private async buildEntitySchema(): Promise<EntitySchema> {
    const columns: { [id: string]: IClientProperty } = {
      ObjectKey: {
        ColumnName: 'ObjectKey',
        Type: ValType.String,
        IsReadOnly: true,
      },
      Display: {
        ColumnName: 'Display',
        Display: await this.translator.get('#LDS#Object').toPromise(),
        Type: ValType.String,
        IsReadOnly: true,
      },
      LastMethodRun: {
        ColumnName: 'LastMethodRun',
        Display: await this.translator.get('#LDS#Last method run').toPromise(),
        Type: ValType.String,
        IsReadOnly: true,
      },
      ObjectType: {
        ColumnName: 'ObjectType',
        Display: await this.translator.get('#LDS#Object type').toPromise(),
        Type: ValType.String,
        IsReadOnly: true,
      },
      LastLogEntry: {
        ColumnName: 'LastLogEntry',
        Display: await this.translator.get('#LDS#Last log entry').toPromise(),
        Type: ValType.Date,
        IsReadOnly: true,
      },
      CanPublish: {
        ColumnName: 'CanPublish',
        Type: ValType.Bool,
        IsReadOnly: true,
      },
      CanDelete: {
        ColumnName: 'CanDelete',
        Type: ValType.Bool,
        IsReadOnly: true,
      },
      CanPublishRestrictionReason: {
        ColumnName: 'CanPublishRestrictionReason',
        Type: ValType.String,
        IsReadOnly: true,
      },
      CanDeleteRestrictionReason: {
        ColumnName: 'CanDeleteRestrictionReason',
        Type: ValType.String,
        IsReadOnly: true,
      },
    };
    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'OutstandingObject', Columns: columns };
  }

  private get selectedNamespaceTitle(): string{
    return this.selectedNamespace?.GetEntity()?.GetDisplayLong();
  }
}
