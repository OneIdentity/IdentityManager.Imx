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

import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { QerApiService } from '../../qer-api-client.service';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { BaseCdr, ColumnDependentReference, EntityService, MetadataService, SnackBarService } from 'qbm';
import { AbstractControl, FormGroup } from '@angular/forms';
import { RoleCompareItems, UiActionData } from 'imx-api-qer';
import { DbObjectKey, FkCandidateBuilder, FkCandidateRouteDto, ValType } from 'imx-qbm-dbts';
import { RoleService } from '../role.service';

/** Compares two roles, with the option of merging the two roles into one. */
@Component({
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss'],
})
export class CompareComponent implements OnInit {
  public compareItems: RoleCompareItems;
  public mergeActions: UiActionData[] = [];
  public mergePreventingReason: string;
  public uidActions: string[] = [];

  public cdrList: ColumnDependentReference[] = [];
  public busy = false;

  public displayedColumns = ['Object', 'Role1', 'Role2'];

  public noChangesText = '#LDS#No actions were found.';

  public LdsSuccessMessage = '#LDS#The roles have been successfully merged. It may take some time for the changes to take effect.';
  public LdsMergeExplanation = "#LDS#The following actions will be taken to merge the two selected roles.";
  public LdsPrepareMergeExplanation = "#LDS#You can review the actions before the roles will be merged.";

  constructor(
    private readonly apiService: QerApiService,
    private readonly entityService: EntityService,
    private readonly metadata: MetadataService,
    private readonly roleService: RoleService,
    private readonly busyService: EuiLoadingService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackbar: SnackBarService,
    @Inject(EUI_SIDESHEET_DATA)
    private readonly sidesheetData: {
      isAdmin: boolean;
      roleType: string;
      uidRole: string;
    },
    private readonly cdref: ChangeDetectorRef
  ) { }

  public roleCdr: ColumnDependentReference;

  public async ngOnInit(): Promise<void> {
    const candidates = await this.roleService.getComparisonConfig();
    this.roleCdr = this.createCdrRole(candidates);
  }

  public getTableDisplay(tableName: string) {
    return this.metadata.tables[tableName].DisplaySingular;
  }

  public async loadCompareItems(): Promise<void> {
    this.busy = true;
    try {
      const keyXml = this.roleCdr.column.GetValue();
      if (!keyXml) {
        this.compareItems = null;
        return;
      }
      const key = DbObjectKey.FromXml(keyXml);
      const items = await this.apiService.v2Client.portal_roles_compare_get(
        this.sidesheetData.roleType,
        this.sidesheetData.uidRole,
        key.TableName,
        key.Keys[0]
      );

      this.compareItems = items;
    } finally {
      this.busy = false;
    }
  }

  public addControl(group: FormGroup, name: string, control: AbstractControl): void {
    group.addControl(name, control);
    this.cdref.detectChanges();
  }

  private createCdrRole(candidateRoutes: FkCandidateRouteDto[]): ColumnDependentReference {
    const fkProviderItems = new FkCandidateBuilder(candidateRoutes, this.apiService.apiClient).build();

    return new BaseCdr(
      this.entityService.createLocalEntityColumn(
        {
          ColumnName: 'uidcomparerole',
          Type: ValType.String,
          ValidReferencedTables: candidateRoutes.map((r) => {
            return { TableName: r.FkParentTableName };
          }),
          MinLen: 1,
        },
        fkProviderItems
      ),
      '#LDS#Select comparison object'
    );
  }

  public async loadMergeActions(): Promise<void> {
    this.busy = true;
    try {
      const keyXml = this.roleCdr.column.GetValue();
      if (!keyXml) {
        this.mergeActions = [];
        this.mergePreventingReason = null;
        return;
      }
      const key = DbObjectKey.FromXml(keyXml);
      const actions = await this.apiService.v2Client.portal_roles_merge_get(
        this.sidesheetData.roleType,
        this.sidesheetData.uidRole,
        key.TableName,
        key.Keys[0]
      );

      if (actions.Actions) {
        this.mergeActions = actions.Actions;
      }
      else {
        this.mergeActions = [];
      }
      this.mergePreventingReason = actions.MergePreventionReason;
      this.uidActions = this.mergeActions.filter(a => a.IsActive).map(a => a.Id);
    } finally {
      this.busy = false;
    }

  }

  /** Submits the request to merge the two roles. */
  public async Execute(): Promise<void> {
    const b = this.busyService.show();
    try {
      const keyXml = this.roleCdr.column.GetValue();
      if (!keyXml) {
        return;
      }
      const key = DbObjectKey.FromXml(keyXml);
      await this.apiService.v2Client.portal_roles_merge_post(
        this.sidesheetData.roleType,
        this.sidesheetData.uidRole,
        key.TableName,
        key.Keys[0],
        {
          ActionId: this.uidActions
        });

      this.sidesheetRef.close(true);
      this.snackbar.open({ key: this.LdsSuccessMessage });
    } finally {
      this.busyService.hide(b);
    }
  }

}
