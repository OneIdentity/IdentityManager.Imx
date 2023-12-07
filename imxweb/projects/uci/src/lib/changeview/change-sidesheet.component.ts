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

import { Component, Inject } from '@angular/core';

import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { ManualChangeOperation, ManualChangeOperationData, OpsupportUciChangedetail } from 'imx-api-uci';
import { ExtendedTypedEntityCollection, IEntityColumn, LocalEntityColumn } from 'imx-qbm-dbts';
import { ConfirmationService } from 'qbm';

import { UciApiService } from '../uci-api-client.service';

@Component({
  templateUrl: './change-sidesheet.component.html',
  styleUrls: ['./change-sidesheet.component.scss'],
})
export class ChangeSidesheetComponent {
  public changeDetail: OpsupportUciChangedetail[] = [];
  public manualChangeData: ManualChangeOperation[][] = [];
  public changeProperties: IEntityColumn[][] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) change: ExtendedTypedEntityCollection<OpsupportUciChangedetail, ManualChangeOperationData>,
    private readonly uciApi: UciApiService,
    private readonly sidesheetRef: EuiSidesheetRef,    
    private readonly confirmation: ConfirmationService
    ) {

    this.changeDetail = change.Data;
    this.manualChangeData = change.extendedData.Operations;

    // build entity columns from extended data
    this.changeProperties = this.manualChangeData.map((d) => {
      return d.map((c) => {
        const prop = new LocalEntityColumn(c.Property, null, null, {
          Value: c.DiffValue,
        });

        return prop;
      });
    });
  }

  public async markAsDone(detail: OpsupportUciChangedetail): Promise<void> {
    if (await this.confirmation.confirm({
      Title: '#LDS#Heading Mark As Successful',
      Message: '#LDS#The provisioning process will be marked as successful. Are you sure you have made the requested change in the cloud application?'
    })) {
      await this.save(detail, true);
    };

  }

  public async markAsError(detail: OpsupportUciChangedetail): Promise<void> {
    if (await this.confirmation.confirm({
      Title: '#LDS#Heading Mark As Failed',
      Message: '#LDS#The provisioning process will be marked as failed. Are you sure you cannot make the requested change in the cloud application?'
    })) {
      await this.save(detail, false);
    };
  }

  public canMarkAsDone(detail: OpsupportUciChangedetail): boolean {
    return detail.IsProcessed.value === 0;
  }

  private async save(detail: OpsupportUciChangedetail, success: boolean): Promise<void> {
    await this.uciApi.client.opsupport_uci_changes_post(detail.GetEntity().GetKeys()[0], { Success: success });
    this.sidesheetRef.close(true /* reload */);
  }
}
