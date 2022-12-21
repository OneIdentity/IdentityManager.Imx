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

import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { TypedEntity } from 'imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference, SnackBarService } from 'qbm';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { CompareComponent } from '../compare/compare.component';
import { DataManagementService } from '../data-management.service';
import { RoleService } from '../role.service';
import { RollbackComponent } from '../rollback/rollback.component';
import { SplitComponent } from '../split/split.component';


@Component({
  selector: 'imx-role-main-data',
  templateUrl: './role-main-data.component.html',
  styleUrls: ['./role-main-data.component.scss'],
})
export class RoleMainDataComponent implements OnInit {
  public editableFields: string[];

  public properties: ColumnDependentReference[] = [];
  public readonly formGroup = new FormGroup({});
  public canCompare: boolean;

  private entity: TypedEntity;
  public canSplitRole: boolean;

  constructor(
    private readonly roleService: RoleService,
    private dataManagementService: DataManagementService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly busyService: EuiLoadingService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translateService: TranslateService,
    private snackbar: SnackBarService) {
    this.formGroup.valueChanges.subscribe(() => {
      this.formGroup.dirty || this.formGroup.invalid ? this.dataManagementService.mainDataDirty(true) : this.dataManagementService.mainDataDirty(false);
    });
  }

  public async ngOnInit(): Promise<void> {
    this.busyService.show();
    try {
      this.entity = this.dataManagementService.entityInteractive;
      this.editableFields = await this.roleService.getEditableFields(this.roleService.ownershipInfo.TableName, this.dataManagementService.entityInteractive.GetEntity());

      const config = await this.projectConfig.getConfig();

      this.canSplitRole = (this.roleService.isAdmin
        ? config.RoleMgmtConfig.Allow_Roles_Split_By_Admin
        : config.RoleMgmtConfig.Allow_Roles_Split_By_Business_Owner)
        && this.roleService.getRoleTypeInfo().canBeSplitSource;
      this.setCdrs();

      // can we compare this role to another role?
      this.canCompare = await this.roleService.canCompare()

    } finally {
      this.busyService.hide();
    }
  }

  public async onValueChanged(): Promise<void> {
    this.formGroup.updateValueAndValidity();
  }

  public addControl(name: string, control: AbstractControl): void {
    this.formGroup.addControl(name, control);
  }

  public async onSave(): Promise<void> {
    this.busyService.show();
    try {
      await this.dataManagementService.refreshInteractive();
      this.formGroup.markAsPristine();
      this.dataManagementService.mainDataDirty(false);
      this.snackbar.open({
        key: '#LDS#Your changes have been successfully saved.'
      });
    } finally {
      this.busyService.hide();
    }
  }

  private setCdrs(): void {
    if (this.properties.length > 0) {
      this.properties = [];
    }

    let cdr: ColumnDependentReference;
    const entity = this.entity.GetEntity();
    const schema = entity.GetSchema();
    for (const columnName of this.editableFields) {
      if (schema.Columns[columnName]) {
        cdr = new BaseCdr(entity.GetColumn(columnName));
        this.properties.push(cdr);
      }
    }
  }

  public async openCompareSidesheet(): Promise<void> {
    this.sidesheet.open(CompareComponent, {
      title: await this.translateService.get('#LDS#Heading Compare and Merge').toPromise(),
      headerColour: 'iris-blue',
      bodyColour: 'asher-gray',
      padding: '0px',
      width: 'max(600px, 60%)',
      testId: 'role-main-data-compare-sidesheet',
    });
  }

  public async openRollbackSidesheet(): Promise<void> {
    const entity = this.entity.GetEntity();
    this.sidesheet.open(RollbackComponent, {
      title: await this.translateService.get('#LDS#Heading Rollback to a previous state').toPromise(),
      headerColour: 'iris-blue',
      bodyColour: 'asher-gray',
      padding: '0px',
      width: 'max(600px, 60%)',
      testId: 'role-main-data-rollback-sidesheet',
      data: {
        tableName: entity.TypeName,
        uid: entity.GetKeys()[0]
      }
    });
  }

  public async splitRole(): Promise<void> {
    const result = await this.sidesheet.open(SplitComponent, {
      title: await this.translateService.get('#LDS#Heading Split').toPromise(),
      headerColour: 'iris-blue',
      bodyColour: 'asher-gray',
      padding: '0px',
      width: 'max(600px, 60%)',
      testId: 'role-main-data-split-sidesheet',
    }).afterClosed().toPromise();

    // if result === true, the role was split
  }
}
