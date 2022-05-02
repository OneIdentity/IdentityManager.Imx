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

import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetRef, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { OwnershipInformation } from 'imx-api-qer';
import { IEntity, TypedEntity } from 'imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference, SnackBarService } from 'qbm';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { CompareComponent } from '../compare/compare.component';
import { RoleService } from '../role.service';
import { SplitComponent } from '../split/split.component';


@Component({
  selector: 'imx-role-main-data',
  templateUrl: './role-main-data.component.html',
  styleUrls: ['./role-main-data.component.scss'],
})
export class RoleMainDataComponent implements OnInit {
  @Input() public item: IEntity;
  @Input() public isAdmin: boolean;
  @Input() public ownershipInfo: OwnershipInformation;
  @Input() public editableFields: string[];

  public properties: ColumnDependentReference[] = [];
  public readonly formGroup = new FormGroup({});
  public canCompare: boolean;

  private entity: TypedEntity;
  public canSplitRole: boolean;

  constructor(
    private readonly roleService: RoleService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly busyService: EuiLoadingService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translateService: TranslateService,
    private snackbar: SnackBarService) {
    this.formGroup.valueChanges.subscribe(() => {
      this.formGroup.dirty || this.formGroup.invalid ? this.roleService.dataDirty(true) : this.roleService.dataDirty(false);
    });
  }

  public async ngOnInit(): Promise<void> {
    this.busyService.show();
    try {
      this.entity = await this.roleService.getInteractive(this.ownershipInfo.TableName, this.item.GetKeys()[0], this.isAdmin);

      const config = await this.projectConfig.getConfig();

      this.canSplitRole = (this.isAdmin 
        ? config.RoleMgmtConfig.Allow_Roles_Split_By_Admin
        : config.RoleMgmtConfig.Allow_Roles_Split_By_Business_Owner)
        && this.roleService.getRoleTypeInfo(this.ownershipInfo.TableName).canBeSplitSource;
      this.setCdrs();

      // can we compare this role to another role?
      this.roleService.getComparisonConfig().then(c =>
        this.canCompare = c.filter(x => x.FkParentTableName == this.ownershipInfo.TableName).length > 0);

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
      await this.entity.GetEntity().Commit(false);
      this.formGroup.markAsPristine();
      this.sidesheetRef.close();
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
    for (const columnName of this.editableFields) {
      if (!entity.GetSchema().Columns[columnName])
        continue;
      cdr = new BaseCdr(entity.GetColumn(columnName));
      this.properties.push(cdr);
    }
  }

  public async openCompareSidesheet(): Promise<void> {
    this.sidesheet.open(CompareComponent, {
      title: await this.translateService.get('#LDS#Heading Compare').toPromise(),
      headerColour: 'iris-blue',
      bodyColour: 'asher-gray',
      padding: '0px',
      width: 'max(600px, 60%)',
      testId: 'role-main-data-compare-sidesheet',
      data: {
        isAdmin: this.isAdmin,
        roleType: this.entity.GetEntity().TypeName,
        uidRole: this.item.GetKeys()[0]
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
      data: {
        isAdmin: this.isAdmin,
        roleType: this.entity.GetEntity().TypeName,
        uidRole: this.item.GetKeys()[0]
      }
    }).afterClosed().toPromise();

    // if result === true, the role was split
  }
}
