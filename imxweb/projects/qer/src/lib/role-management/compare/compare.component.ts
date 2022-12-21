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

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

import { ColumnDependentReference, DataSourceToolbarSettings, MetadataService, SnackBarService } from 'qbm';
import { RoleCompareItem, RoleCompareItems, UiActionData } from 'imx-api-qer';
import { DbObjectKey, IClientProperty, ValType } from 'imx-qbm-dbts';
import { CompareService } from './compare.service';
import { RoleService } from '../role.service';
import { DataManagementService } from '../data-management.service';
import { CompareItemBuilder } from './compare-item-builder';
import { CompareItem } from './compare-item';

/** Compares two roles, with the option of merging the two roles into one. */
@Component({
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss'],
})
export class CompareComponent implements OnInit {
  // Takes place of the previous injected data
  public roleType: string;
  public uidRole: string;

  public compareItems: RoleCompareItems | null = null;
  public mergeActions: UiActionData[] | undefined = undefined;
  public mergePreventingReason: string | null;
  public uidActions: string[] | undefined = undefined;

  public cdrList: ColumnDependentReference[] = [];

  public dstSettings: DataSourceToolbarSettings;

  public displayedColumns: IClientProperty[] = [
    { ColumnName: 'assigned', Type: ValType.String },
    { ColumnName: 'current', Type: ValType.String },
    { ColumnName: 'other', Type: ValType.String },
  ];

  public readonly roleForm = new FormGroup({});

  public noChangesText = '#LDS#There are no actions that can be performed.';

  public LdsSuccessMessage = '#LDS#The objects have been successfully merged. It may take some time for the changes to take effect.';
  public LdsMergeExplanation = '#LDS#The following actions will be performed to merge the selected objects.';
  public LdsPrepareMergeExplanation = '#LDS#You can review the actions before the objects are merged.';
  public ldsKeyNotAvailable = '#LDS#The object to be compared could not be found. Please try again or select another object to compare.';

  public showKeyMissingError = false;
  private readonly compareItemBuilder = new CompareItemBuilder();

  constructor(
    private readonly compareService: CompareService,
    private readonly metadata: MetadataService,
    private readonly roleService: RoleService,
    private readonly dataManagementService: DataManagementService,
    private readonly busyService: EuiLoadingService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackbar: SnackBarService,
    private readonly cdref: ChangeDetectorRef
  ) {}

  public roleCdr: ColumnDependentReference;

  public async ngOnInit(): Promise<void> {
    // Set initial values
    this.roleType = this.dataManagementService.entityInteractive.GetEntity().TypeName;
    this.uidRole = this.dataManagementService.entityInteractive.GetEntity().GetKeys().join(',');

    const candidates = await this.roleService.getComparisonConfig();
    this.roleCdr = this.compareService.createCdrRole(candidates);
  }

  public getTableDisplay(tableName: string) {
    return this.metadata.tables[tableName].DisplaySingular;
  }

  public resetElements(): void {
    this.compareItems = null;
    this.mergeActions = undefined;
    this.uidActions = undefined;
  }

  public async selectedStepChanged(event: StepperSelectionEvent): Promise<void> {
    if (event.selectedIndex === 1) {
      await this.loadCompareItems();
    }

    if (event.selectedIndex === 2) {
      await this.loadMergeActions();
    }
  }

  public addControl(group: FormGroup, name: string, control: AbstractControl): void {
    group.addControl(name, control);
    this.cdref.detectChanges();
  }

  /** Submits the request to merge the two roles. */
  public async execute(): Promise<void> {
    const overlay = this.busyService.show();
    try {
      const keyXml = this.roleCdr.column.GetValue();
      this.showKeyMissingError = !keyXml;
      if (!keyXml) {
        return;
      }
      const key = DbObjectKey.FromXml(keyXml);
      await this.compareService.mergeRoles(this.roleType, this.uidRole, key, { ActionId: this.uidActions });
      this.sidesheetRef.close(true);
      this.snackbar.open({ key: this.LdsSuccessMessage });
    } finally {
      this.busyService.hide(overlay);
    }
  }

  private async loadCompareItems(): Promise<void> {
    if (this.compareItems) {
      return;
    }
    const overlay = this.busyService.show();
    try {
      const keyXml = this.roleCdr.column.GetValue();
      this.showKeyMissingError = !keyXml;
      if (!keyXml) {
        this.compareItems = null;
        return;
      }
      const key = DbObjectKey.FromXml(keyXml);
      const items = await this.compareService.getCompares(this.roleType, this.uidRole, key);

      this.compareItems = items;
      const dataSource = this.compareItemBuilder.build(this.compareItemBuilder.buildEntityCollectionData(this.compareItems.Items as RoleCompareItem[]));
      this.dstSettings = {
        dataSource,
        entitySchema: CompareItem.GetEntitySchema(),
        navigationState: {},
        displayedColumns: this.displayedColumns,
      };
    } finally {
      this.busyService.hide(overlay);
    }
  }

  private async loadMergeActions(): Promise<void> {
    if (this.mergeActions) {
      return;
    }
    const overlay = this.busyService.show();

    try {
      const keyXml = this.roleCdr.column.GetValue();
      this.showKeyMissingError = !keyXml;
      if (!keyXml) {
        this.mergeActions = undefined;
        this.mergePreventingReason = null;
        return;
      }
      const key = DbObjectKey.FromXml(keyXml);
      const actions = await this.compareService.getMergeActions(this.roleType, this.uidRole, key);

      if (actions.Actions) {
        this.mergeActions = actions.Actions;
      } else {
        this.mergeActions = [];
      }
      this.mergePreventingReason = actions.MergePreventionReason as string;
      this.uidActions = this.mergeActions.filter((a) => a.IsActive).map((a) => a.Id) as string[];
    } finally {
      this.busyService.hide(overlay);
    }
  }
}
