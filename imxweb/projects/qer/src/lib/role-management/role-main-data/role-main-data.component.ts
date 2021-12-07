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
import { EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';

import { OwnershipInformation } from 'imx-api-qer';
import { EntitySchema, IEntity, TypedEntity } from 'imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference, SnackBarService } from 'qbm';
import { RoleService } from '../role.service';


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

  private entity: TypedEntity;

  constructor(
    private readonly roleService: RoleService,
    private readonly busyService: EuiLoadingService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private snackbar: SnackBarService) {
      this.formGroup.valueChanges.subscribe(value => {
        this.formGroup.dirty || this.formGroup.invalid ? this.roleService.dataDirty(true) : this.roleService.dataDirty(false);
      });
    }

  public async ngOnInit(): Promise<void> {
    this.busyService.show();
    try {
      this.entity = await this.roleService.getInteractive(this.ownershipInfo, this.item.GetKeys()[0], this.isAdmin);
      this.setCdrs();
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
      if(!entity.GetSchema().Columns[columnName])
         continue;
      cdr = new BaseCdr(entity.GetColumn(columnName));
      this.properties.push(cdr);
    }
  }
}
