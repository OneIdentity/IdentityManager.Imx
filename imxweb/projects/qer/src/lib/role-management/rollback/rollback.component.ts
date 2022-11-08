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

import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { ColumnDependentReference, DataSourceToolbarComponent, DataSourceToolbarSettings, MetadataService, SnackBarService } from 'qbm';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { QerApiService } from '../../qer-api-client.service';
import { UiActionData } from 'imx-api-qer';
import { RollebackService } from './rollback.service';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ComparisonItem, RollbackItem } from './rollback-item';
import { RollbackItemBuilder } from './rollback-item-builder';
import { IClientProperty } from 'imx-qbm-dbts';

@Component({
  templateUrl: './rollback.component.html',
  styleUrls: ['./rollback.component.scss'],
})
export class RollbackComponent implements OnInit {
  public busy = false;
  public completed = false;
  public actions: UiActionData[] = [];
  public uidActions: string[] = [];
  public comparisonItems: ComparisonItem[] = [];

  public displayedColumns: IClientProperty[] = [];
  public dstSettings: DataSourceToolbarSettings;
  public ldsChangesQueued = '#LDS#The object has been successfully reset. It may take some time for the changes to take effect.';
  public dateCdr: ColumnDependentReference;
  public dateForm = new FormGroup({}, this.workaroundValidator());
  public comparisonForm = new FormGroup({
    helperInput: new FormControl(undefined, Validators.required),
  });
  public selected: RollbackItem[] = [];

  public entitySchema = RollbackItem.GetEntitySchema();

  public ldsNoChanges = '#LDS#No changes during selected time period.';

  public ldsActionList = '#LDS#The following actions will be taken to roll back the role to the previous state.';

  public ldsSelectItems =
    '#LDS#The following properties have changed. Select the properties that you want to roll back to the previous state.';

  private rollbackbuilder = new RollbackItemBuilder();
  private calculateCompareItems = true;
  private calculateActions = true;
  @ViewChild(DataSourceToolbarComponent) private readonly dst: DataSourceToolbarComponent;


  constructor(
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackbar: SnackBarService,
    private readonly api: QerApiService,
    private readonly busyService: EuiLoadingService,
    private readonly metadata: MetadataService,
    private readonly rollbackService: RollebackService,
    @Inject(EUI_SIDESHEET_DATA)
    private readonly data: {
      tableName: string;
      uid: string;
    },
    private readonly cdref: ChangeDetectorRef
  ) {
    this.dateCdr = this.rollbackService.createCdrDate();
    this.displayedColumns = [
      this.entitySchema.Columns.Property,
      this.entitySchema.Columns.HistoryValueDisplay,
      this.entitySchema.Columns.CurrentValueDisplay,
    ];
  }

  public ngOnInit(): void {
    this.cdref.detectChanges();
  }

  public resetControls(): void {
    this.calculateActions = true;
    this.calculateCompareItems = true;
    this.comparisonForm.get('helperInput').setValue(undefined);
    this.comparisonItems = [];
    this.selected = [];
    this.dst?.clearSelection();
    this.dstSettings = undefined;
    this.actions = [];
    this.uidActions = [];
  }

  public addControl(name: string, control: AbstractControl): void {
    this.dateForm.addControl(name, control);
    this.cdref.detectChanges();
  }

  public selectionChanged(selection: RollbackItem[]): void {
    this.selected = selection;
    this.calculateActions = true;
    this.comparisonForm.get('helperInput').setValue(this.selected.length > 0 ? 'filled' : undefined);
  }

  public async loadCompareItems(): Promise<void> {
    if (!this.calculateCompareItems) {
      return;
    }
    const overlay = this.busyService.show();
    this.comparisonItems = [];
    try {
      this.comparisonItems = (
        await this.api.client.portal_history_comparison_get(this.data.tableName, this.data.uid, {
          CompareDate: this.dateCdr.column.GetValue(),
        })
      )
        // only take the items that have changed
        .filter((item) => item.HasChanged);

      await this.enhanceWithTypeDisplay(this.comparisonItems);

      const dataSource = this.rollbackbuilder.build(this.rollbackbuilder.buildEntityCollectionData(this.comparisonItems));
      this.dstSettings = {
        dataSource,
        entitySchema: RollbackItem.GetEntitySchema(),
        navigationState: {},
        displayedColumns: this.displayedColumns,
      };
    } finally {
      this.busyService.hide(overlay);
      this.calculateCompareItems = false;
    }
  }

  public async selectedStepChanged(event: StepperSelectionEvent): Promise<void> {
    if (this.completed) {
      return;
    }

    if (event.selectedIndex === 1) {
      await this.loadCompareItems();
    }

    if (event.selectedIndex === 2 && event.previouslySelectedIndex === 1) {
      await this.loadActions();
    }
  }

  public async execute(): Promise<void> {
    const overlay = this.busyService.show();
    try {
      await this.api.client.portal_history_rollback_post(
        this.data.tableName,
        this.data.uid,
        {
          ActionId: this.uidActions,
        },
        {
          CompareDate: this.dateCdr.column.GetValue(),
          CompareId: this.selected.map((s) => s.Id.value).reduce((a, b) => a + ',' + b),
        }
      );
      this.completed = true;

      this.sidesheetRef.close(true);
      this.snackbar.open({ key: this.ldsChangesQueued });
    } finally {
      this.busyService.hide(overlay);
    }
  }

  // A little workaround, because the data-cdr is not validating properly
  private workaroundValidator(): ValidatorFn {
    return (control: AbstractControl): { error: string } | null => {
      if (control == null) {
        return null;
      }

      return control.get('ComparisonDate')?.value ? null : { error: 'required' };
    };
  }

  private async enhanceWithTypeDisplay(obj: ComparisonItem[]): Promise<void> {
    await this.metadata.updateNonExisting(obj.map((i) => i.TableName));
    obj.forEach((element) => {
      element.TypeDisplay = this.metadata.tables[element.TableName].DisplaySingular;
    });
  }

  private async loadActions(): Promise<void> {
    if (!this.calculateActions) {
      return;
    }
    // load actions
    this.actions = [];
    this.uidActions = [];
    const overlay = this.busyService.show();
    try {
      this.actions = await this.api.client.portal_history_rollback_get(this.data.tableName, this.data.uid, {
        CompareDate: this.dateCdr.column.GetValue(),
        CompareId: this.selected.map((s) => s.Id.value).reduce((a, b) => a + ',' + b),
      });
      this.uidActions = this.actions.filter((a) => a.CanExecute).map((a) => a.Id);
    } finally {
      this.calculateActions = false;
      this.busyService.hide(overlay);
    }
  }
}
