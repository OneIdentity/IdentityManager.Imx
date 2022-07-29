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

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PortalTargetsystemUnsSystem } from 'imx-api-arc';
import { DataDeleteOptions, DeHelperService } from 'tsb';
import { EuiSelectOption } from '@elemental-ui/core';
import { DeleteDataService } from './delete-data.service';
import { DbObjectKey } from 'imx-qbm-dbts';

@Component({
  selector: 'imx-delete-data',
  templateUrl: './delete-data.component.html',
  styleUrls: ['./delete-data.component.scss'],
})
export class DeleteDataComponent {
  public authorities: EuiSelectOption[];
  public selectedAuthority: EuiSelectOption;
  public selectPending = false;

  constructor(
    public dialogRef: MatDialogRef<DeleteDataComponent>,
    private readonly dataHelper: DeHelperService,
    private readonly deleteDataService: DeleteDataService,
    @Inject(MAT_DIALOG_DATA) public data: DataDeleteOptions
  ) {
    this.setupAuthorities(data.authorities);
  }

  public domainSearch(search?: string): void {
    this.selectPending = true;

    this.dataHelper
      .getAuthorityData(search)
      .then((data) => {
        this.setupAuthorities(data.authorities);
      })
      .finally(() => {
        this.selectPending = false;
      });
  }

  public domainSelected(selected?: EuiSelectOption): void {
    if (selected && selected.value) {
      this.selectedAuthority = selected;
    } else {
      this.selectedAuthority = undefined;
    }
  }

  public domainSearchFilter(): boolean {
    return true;
  }

  public delete(): void {
    const xobjectkey = DbObjectKey.FromXml(<string>this.selectedAuthority.value);
    this.deleteDataService.deleteData(xobjectkey.TableName, xobjectkey.Keys[0]).then(() => this.dialogRef.close(this.selectedAuthority.value));
  }

  private setupAuthorities(authorities: PortalTargetsystemUnsSystem[]): void {
    this.authorities = [];

    if (this.data.hasAuthorities) {
      this.authorities = authorities.map((a: PortalTargetsystemUnsSystem) => {
        return { display: a.GetEntity().GetDisplay(), value: a.XObjectKey.value, hasSync: a.HasSync.value };
      });
    }
  }
}
