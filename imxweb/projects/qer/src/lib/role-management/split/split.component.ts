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

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DbObjectKey, IEntity, WriteExtTypedEntity } from 'imx-qbm-dbts';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { IRoleSplitItem, RoleExtendedDataWrite, UiActionData } from 'imx-api-qer';
import { EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { RoleService } from '../role.service';
import { CdrFactoryService, ColumnDependentReference, MetadataService, SnackBarService } from 'qbm';
import { TranslateService } from '@ngx-translate/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { DataManagementService } from '../data-management.service';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { SplitService } from './split.service';

@Component({
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.scss'],
})
export class SplitComponent implements OnInit {
  // Takes place of the previous injected data
  public roleType: string;
  public uidRole: string;

  public splitItems: IRoleSplitItem[] = [];
  public actions: UiActionData[] = [];
  public newRoleType: string;

  public candidateTables: {
    tableName: string;
    display: string;
  }[] = [];
  public canChangeRoleType: boolean;
  public newRole: IEntity;
  public typedEntity: WriteExtTypedEntity<RoleExtendedDataWrite>;
  public cdrList: ColumnDependentReference[] = [];
  public uidActions: string[] = [];
  public types: string[] = [];
  public readonly newRoleFormGroup = new UntypedFormGroup({});
  public busy = false;
  public isLoading = false;

  public ldsInfoMessage = '#LDS#Specify the following properties for the new object.';

  public noRoleText = '#LDS#There is nothing assigned to this object.';

  public noChangesText = '#LDS#Heading No Assignments Selected';
  public noChangesTextLong = '#LDS#A new object without any assignments will be created. All assignments are kept in the source object.';
  private ldsSuccessMessage = '#LDS#The new object has been successfully created. It may take some time for the changes to take effect.';

  constructor(
    private readonly splitService: SplitService,
    private readonly busySvc: EuiLoadingService,
    private readonly roleService: RoleService,
    private dataManagementService: DataManagementService,
    private readonly translate: TranslateService,
    private readonly cdref: ChangeDetectorRef,
    private readonly snackbar: SnackBarService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly qerConfig: ProjectConfigurationService,
    private readonly metadata: MetadataService,
    private readonly cdrFactoryService: CdrFactoryService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.busy = true;
    try {
      // Set initial values
      this.roleType = this.dataManagementService.entityInteractive.GetEntity().TypeName;
      this.uidRole = this.dataManagementService.entityInteractive.GetEntity().GetKeys().join(',');
      this.types = [
        await this.translate.get('#LDS#Keep and do not copy or move to new object').toPromise(),
        await this.translate.get('#LDS#Keep and copy to new object').toPromise(),
        await this.translate.get('#LDS#Move to new object').toPromise(),
      ];
      const config = await this.qerConfig.getConfig();
      const tableNames = this.roleService.getSplitTargets();
      await this.metadata.updateNonExisting(tableNames);
      this.candidateTables = tableNames.map((t) => {
        return {
          tableName: t,
          display: this.metadata.tables[t].DisplaySingular,
        };
      });

      this.canChangeRoleType = config.RoleMgmtConfig.Allow_Roles_Split_Different_Organisation_Type;

      // pre-select role type
      this.newRoleType = this.roleType.slice();
      await this.roleTypeChanged();
    } finally {
      this.busy = false;
    }
  }

  public async selectedStepChanged(event: StepperSelectionEvent): Promise<void> {
    if (event.selectedIndex === 1 && event.previouslySelectedIndex < 1) {
      await this.loadSplitItems();
    }

    if (event.selectedIndex === 2 && event.previouslySelectedIndex < 2) {
      await this.getSplittOptions();
    }
  }

  public getTableDisplay(name: string): string {
    return this.metadata.tables[name].DisplaySingular;
  }

  public async roleTypeChanged(): Promise<void> {
    if (this.cdrList.length > 0) {
      this.cdrList.forEach((elem) => this.newRoleFormGroup.removeControl(elem.column.ColumnName));
    }
    const b = this.busySvc.show();
    try {
      this.typedEntity = await this.roleService.getInteractiveNew(this.newRoleType);
      // set the source role
      await this.typedEntity.setExtendedData({
        RoleSplit: {
          SourceRoleObjectKey: new DbObjectKey(this.roleType, this.uidRole).ToXmlString(),
        },
      });
      this.newRole = this.typedEntity.GetEntity();
      this.cdrList = this.cdrFactoryService.buildCdrFromColumnList(
        this.newRole,
        await this.roleService.getEditableFields(this.newRoleType, this.newRole, true)
      );
    } finally {
      this.busySvc.hide(b);
    }
  }

  public addControl(group: UntypedFormGroup, name: string, control: AbstractControl): void {
    group.addControl(name, control);
    this.cdref.detectChanges();
  }

  public async execute(): Promise<void> {
    const b = this.busySvc.show();
    try {
      // set extended data with the split information
      await this.typedEntity.setExtendedData({
        RoleSplit: {
          ActionIds: this.uidActions,
          SplitItems: this.splitItems.map((i) => {
            return {
              Item: i.Uid,
              Type: i.SplitType,
            };
          }),
        },
      });
      this.newRole.Commit();

      this.sidesheetRef.close(true);
      this.snackbar.open({ key: this.ldsSuccessMessage });
    } finally {
      this.busySvc.hide(b);
    }
  }

  private async loadSplitItems(): Promise<void> {
    const b = this.busySvc.show();
    try {
      this.isLoading = true;
      const items = await this.splitService.getSplitItems(this.roleType, this.uidRole, this.newRoleType, this.newRole.GetKeys()[0]);

      await this.metadata.updateNonExisting(items.map((i) => i.ObjectType));

      // first load data and displays - then set local property, avoiding evaluation of table displays before they are loaded
      this.splitItems = items;
    } finally {
      this.isLoading = false;
      this.busySvc.hide(b);
    }
  }

  private async getSplittOptions(): Promise<void> {
    const b = this.busySvc.show();
    try {
      this.isLoading = true;
      this.actions = await this.splitService.getSplitOptions(this.roleType, this.uidRole, this.newRoleType, this.newRole.GetKeys()[0], {
        SplitItems: this.splitItems.map((i) => {
          return {
            Item: i.Uid,
            Type: i.SplitType,
          };
        }),
      });
      this.uidActions = this.actions.filter((a) => a.IsActive).map((a) => a.Id);
    } finally {
      this.isLoading = false;
      this.busySvc.hide(b);
    }
  }
}
