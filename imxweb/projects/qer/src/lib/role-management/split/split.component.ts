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
 * Copyright 2021 One Identity LLC.
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
import { DbObjectKey, IEntity, WriteExtTypedEntity } from 'imx-qbm-dbts';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { QerApiService } from '../../qer-api-client.service';
import { IRoleSplitItem, RoleExtendedDataWrite, UiActionData } from 'imx-api-qer';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { RoleService } from '../role.service';
import { BaseCdr, ColumnDependentReference, MetadataService, SnackBarService } from 'qbm';
import { TranslateService } from '@ngx-translate/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Component({
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.scss']
})
export class SplitComponent implements OnInit {

  public splitItems: IRoleSplitItem[] = [];
  public actions: UiActionData[] = [];
  public newRoleType: string;

  public candidateTables: {
    tableName: string,
    display: string
  }[] = [];
  public canChangeRoleType: boolean;
  public newRole: IEntity;
  public typedEntity: WriteExtTypedEntity<RoleExtendedDataWrite>;
  public cdrList: ColumnDependentReference[] = [];
  public uidActions: string[] = [];
  public types: string[] = [];
  public readonly newRoleFormGroup = new FormGroup({});
  public busy = false;
  public isLoading = false;

  public LdsSuccessMessage = '#LDS#The new object has been successfully created. It may take some time for the changes to take effect.';
	public LdsInfoMessage = '#LDS#Specify the following properties for the new object.';

  public noRoleText = '#LDS#There are no assignments for this role';

  public noChangesText = '#LDS#There are no assignments for the new role.';
  public noChangesTextLong = '#LDS#A new empty role will be created. All assignments will stay in the original role.';

  constructor(
    private readonly apiService: QerApiService,
    private readonly busySvc: EuiLoadingService,
    private readonly roleService: RoleService,
    private readonly translate: TranslateService,
    @Inject(EUI_SIDESHEET_DATA) private readonly sidesheetData: {
      isAdmin: boolean;
      roleType: string,
      uidRole: string
    },
    private readonly cdref: ChangeDetectorRef,
    private readonly snackbar: SnackBarService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly qerConfig: ProjectConfigurationService,
    private readonly metadata: MetadataService
  ) { }

  public async ngOnInit(): Promise<void> {
    this.busy = true;
    try {
      this.types = [
        await this.translate.get('#LDS#RoleSplitActionKeep').toPromise(),
        await this.translate.get('#LDS#RoleSplitActionCopy').toPromise(),
        await this.translate.get('#LDS#RoleSplitActionMove').toPromise()
      ];
      const config = await this.qerConfig.getConfig();
      const tableNames = this.roleService.getSplitTargets();
      await this.metadata.updateNonExisting(tableNames);
      this.candidateTables = tableNames
        .map(t => {
          return {
            tableName: t,
            display: this.metadata.tables[t].DisplaySingular
          };
        });

      this.canChangeRoleType = config.RoleMgmtConfig.Allow_Roles_Split_Different_Organisation_Type;

      if (!this.canChangeRoleType) {
        // pre-select role type
        this.newRoleType = this.sidesheetData.roleType;
        await this.roleTypeChanged();
      }
    } finally {
      this.busy = false;
    }
  }

  public async loadSplitItems(): Promise<void> {
    const b = this.busySvc.show();
    try {
      this.isLoading = true;
      const items = await this.apiService.v2Client.portal_roles_split_get(this.sidesheetData.roleType, this.sidesheetData.uidRole,
        this.newRoleType, this.newRole.GetKeys()[0]);

      await this.metadata.updateNonExisting(items.map(i => i.ObjectType));

      // first load data and displays - then set local property, avoiding evaluation of table displays before they are loaded
      this.splitItems = items;
    } finally {
      this.isLoading = false;
      this.busySvc.hide(b);
    }
  }

  public getTableDisplay(name: string): string {
    return this.metadata.tables[name].DisplaySingular;
  }

  public async roleTypeChanged(): Promise<void> {
    if (this.cdrList.length > 0) {
      this.cdrList.forEach(elem =>
        this.newRoleFormGroup.removeControl(elem.column.ColumnName));
    }
    const b = this.busySvc.show();
    try {
      this.typedEntity = await this.roleService.getInteractiveNew(this.newRoleType, this.sidesheetData.isAdmin);
      // set the source role
      await this.typedEntity.setExtendedData({
        RoleSplit: {
          SourceRoleObjectKey: new DbObjectKey(this.sidesheetData.roleType, this.sidesheetData.uidRole).ToXmlString()
        }
      });
      this.newRole = this.typedEntity.GetEntity();
      this.cdrList = (await this.roleService.getEditableFields(this.newRoleType, this.newRole, true))
        .map(columnName => new BaseCdr(this.newRole.GetColumn(columnName)));
    } finally {
      this.busySvc.hide(b);
    }
  }

  public async WizardPage2_OnNext(): Promise<void> {
    const b = this.busySvc.show();
    try {
      this.isLoading = true;
      this.actions = await this.apiService.v2Client.portal_roles_split_post(this.sidesheetData.roleType, this.sidesheetData.uidRole,
        this.newRoleType, this.newRole.GetKeys()[0], {
        SplitItems: this.splitItems.map(i => {
          return {
            Item: i.Uid,
            Type: i.SplitType
          };
        })
      });
      this.uidActions = this.actions.filter(a => a.IsActive).map(a => a.Id);
    } finally {
      this.isLoading = false;
      this.busySvc.hide(b);
    }
  }

  public addControl(group: FormGroup, name: string, control: AbstractControl): void {
    group.addControl(name, control);
    this.cdref.detectChanges();
  }


  public async Execute(): Promise<void> {
    const b = this.busySvc.show();
    try {
      // set extended data with the split information
      await this.typedEntity.setExtendedData({
        RoleSplit: {
          ActionIds: this.uidActions,
          SplitItems: this.splitItems.map(i => {
            return {
              Item: i.Uid,
              Type: i.SplitType
            };
          })
        }
      });
      this.newRole.Commit();

      this.sidesheetRef.close(true);
      this.snackbar.open({ key: this.LdsSuccessMessage });
    } finally {
      this.busySvc.hide(b);
    }
  }
}
