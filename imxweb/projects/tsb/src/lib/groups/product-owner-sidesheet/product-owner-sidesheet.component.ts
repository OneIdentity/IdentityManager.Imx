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

import { Component, Inject, ViewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { PortalTargetsystemUnsGroupServiceitem } from 'imx-api-tsb';
import { IEntityColumn } from 'imx-qbm-dbts';
import { BaseCdr } from 'qbm';
import { OwnerControlComponent } from 'qer';
import { ProductOwnerSidesheetService } from './product-owner-sidesheet.service';

@Component({
  templateUrl: './product-owner-sidesheet.component.html',
  styleUrls: ['./product-owner-sidesheet.component.scss']
})
export class ProductOwnerSidesheetComponent {

  public productOwnerCdr: BaseCdr;

  public column: IEntityColumn;

  public prdOwnerControl: AbstractControl;
  @ViewChild('ownerControl') public ownercontrol: OwnerControlComponent;

  constructor(
    private readonly sidesheetRef: EuiSidesheetRef,
    ownerService: ProductOwnerSidesheetService,
    @Inject(EUI_SIDESHEET_DATA) sidesheetData: PortalTargetsystemUnsGroupServiceitem
  ) {
    this.column = ownerService.buildOrgRulerColumn(sidesheetData.GetEntity());
  }

  public onFormControlCreated(control: AbstractControl): void {
    setTimeout(() => {
      this.prdOwnerControl = control;
    }, 1000);
  }

  public returnProductOwner(): void {
    this.sidesheetRef.close({ uidPerson: this.ownercontrol.uidPersonSelected, uidRole: this.ownercontrol.uidRoleSelected });
  }

}
