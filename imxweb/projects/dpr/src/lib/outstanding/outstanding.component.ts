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
 * Copyright 2022 One Identity LLC.
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
  ValType
} from 'imx-qbm-dbts';
import { ConfirmationService, DataSourceToolbarSettings, SnackBarService } from 'qbm';
import { DependenciesComponent } from './dependencies.component';
import { OutstandingObjectEntity } from './outstanding-object-entity';
import { OutstandingService } from './outstanding.service';
import { SelectedItemsComponent } from './selected-items/selected-items.component';


@Component({
  templateUrl: './outstanding.component.html',
  styleUrls: ['./outstanding.component.scss']
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

  constructor(
    private readonly apiService: OutstandingService,
    private readonly translator: TranslateService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly confirmationService: ConfirmationService,
    private readonly snackbar: SnackBarService,
    private readonly translate: TranslateService,
    private readonly busyService: EuiLoadingService) {
  }

  public async ngOnInit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.schema = await this.buildEntitySchema();
      this.buildDstSettings({ Data: [], totalCount: 0 });
      const typed = await this.apiService.getNamespaces();
      this.namespaces = typed.Data;
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public async tableSelected(table: OpsupportOutstandingTables): Promise<void> {
    this.selectedTable = table;
    this.selected = [];
    await this.navigate();
  }

  public async optionSelected(newNamespace: OpsupportNamespaces): Promise<void> {
    this.selectedNamespace = newNamespace;
    this.tabledata = [];
    this.selectedTable = null;
    this.selected = [];
    this.navigate();
    if (newNamespace) {
      let overlayRef: OverlayRef;
      setTimeout(() => overlayRef = this.busyService.show());
      try {
        this.tabledata = (await this.apiService.getTableData(newNamespace))
          .Data
          // remove tables without outstanding objects
          .filter(m => m.CountOutstanding.value > 0);
      } finally {
        setTimeout(() => this.busyService.hide(overlayRef));
      }
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
      headerColour: 'iris-blue',
      bodyColour: 'asher-gray',
      padding: '0',
      width: 'max(550px, 55%)',
      data: { objects, schema: this.schema },
      testId: 'outstanding-objects-selected-elements-sidesheet'
    }
    );
  }

  public async confirmDependencies(action: OutstandingAction): Promise<boolean> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());

    let dependencies: DependencyToConfirm[];
    try {
      dependencies = await this.apiService.getDependencies(action,
        this.selected.map(m => m.ObjectKey.value));
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }

    // no dependencies? don't show confirmation dialog
    if (dependencies.length === 0) {
      return true;
    }

    const sidesheetRef = this.sidesheet.open(DependenciesComponent, {
      title: await this.translator.get('#LDS#Heading View Dependencies').toPromise(),
      headerColour: 'iris-tint',
      padding: '0px',
      width: 'max(600px, 55%)',
      data: {
        dependencies,
        action
      }
    });
    const fromsidesheet = await sidesheetRef.afterClosed().toPromise();
    return fromsidesheet;
  }

  public canPublishAllSelected(): boolean {
    return this.selected.every(elem => elem.CanPublish.value);
  }

  public async deleteObjects(): Promise<void> {
    return this.processWithConfirmation(OutstandingAction.Delete);
  }

  public async resetObjects(): Promise<void> {
    return this.processWithConfirmation(OutstandingAction.DeleteState);
  }

  public async publishObjects(): Promise<void> {
    return this.processWithConfirmation(OutstandingAction.Publish);
  }

  public getNoDataText(): string {
    return this.selectedNamespace
      ? '#LDS#There are currently no outstanding objects.'
      : '#LDS#Select a target system.';
  }

  private buildDstSettings(data: TypedEntityCollectionData<OutstandingObjectEntity>): void {
    this.dstSettings = {
      navigationState: {},
      dataSource: data,
      entitySchema: this.schema,
      displayedColumns: [
        this.schema.Columns.Display,
        this.schema.Columns.LastLogEntry
      ]
    };
  }

  private async navigate(): Promise<void> {
    if (!this.selectedNamespace) {
      this.buildDstSettings({ Data: [], totalCount: 0 });
    }
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());

    try {
      let baseObjects: OutstandingObject[];
      if (this.selectedTable) {
        baseObjects = await this.apiService.getOutstandingTable(this.selectedTable.TableName.value,
          this.selectedNamespace.Ident_DPRNameSpace.value);
      } else {
        baseObjects = await this.apiService.getOutstandingNamespace(this.selectedNamespace.Ident_DPRNameSpace.value);
      }
      const typedEntities = baseObjects.map(obj => new OutstandingObjectEntity(new ReadOnlyEntity(this.dstSettings.entitySchema, {
        Keys: [obj.ObjectKey],
        Columns: {
          ObjectKey: {
            Value: obj.ObjectKey
          },
          CanDelete: {
            Value: obj.CanDelete
          },
          CanPublish: {
            Value: obj.CanPublish
          },
          Display: {
            Value: obj.Display
          },
          LastLogEntry: {
            Value: obj.LastLogEntry
          },
          ObjectType: {
            Value: obj.ObjectType
          },
          LastMethodRun: {
            Value: obj.LastMethodRun
          }
        }
      })));
      this.buildDstSettings({
        Data: typedEntities,
        totalCount: typedEntities.length
      });
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  private async processWithConfirmation(action: OutstandingAction): Promise<void> {
    let canProceed = await this.confirmationService.confirm({
      Title: this.getConfirmationTitle(action),
      Message: this.getConfirmationText(action),
      identifier: 'shoppingcart-for-later-delete'
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
    setTimeout(() => overlayRef = this.busyService.show());

    try {
      await this.apiService.processObjects(action, this.bulk, this.selected.map(k => k.ObjectKey.value));
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
        return this.selected.length > 1 ? '#LDS#Are you sure you want to delete the selected objects in the database?'
          : '#LDS#Are you sure you want to delete the selected object in the database?';
      case OutstandingAction.DeleteState:
        return this.selected.length > 1 ? '#LDS#Are you sure you want to remove the Outstanding labels for the selected objects?'
          : '#LDS#Are you sure you want to remove the Outstanding label for the selected object?';
      case OutstandingAction.Publish:
        return this.selected.length > 1 ? '#LDS#Are you sure you want to add the selected objects to the target system?'
          : '#LDS#Are you sure you want to add the selected object to the target system?';
    }
  }

  private getSnackbarText(action: OutstandingAction): string {
    switch (action) {
      case OutstandingAction.Delete:
        return this.selected.length > 1 ? '#LDS#The objects have been successfully deleted in the database.'
          : '#LDS#The object has been successfully deleted in the database.';
      case OutstandingAction.DeleteState:
        return this.selected.length > 1 ? '#LDS#The Outstanding labels have been successfully removed for the objects.'
          : '#LDS#The Outstanding label has been successfully removed for the object.';
      case OutstandingAction.Publish:
        return this.selected.length > 1 ? '#LDS#The objects have been successfully added to the target system.'
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
      }
    };
    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'OutstandingObject', Columns: columns };
  }
}
