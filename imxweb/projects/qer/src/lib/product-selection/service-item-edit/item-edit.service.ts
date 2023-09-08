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

import { Injectable } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalCartitem } from 'imx-api-qer';
import { BaseCdr, BulkItem, BulkItemStatus } from 'qbm';
import { ExtendedEntityWrapper } from '../../parameter-data/extended-entity-wrapper.interface';
import { ServiceItemEditComponent } from './service-item-edit.component';

@Injectable({
  providedIn: 'root'
})
export class ItemEditService {
  constructor(
    private readonly sidesheetService: EuiSidesheetService,
    private readonly translateService: TranslateService
  ) { }

  public async openEditor(cartItems: ExtendedEntityWrapper<PortalCartitem>[])
    : Promise<{ submit: boolean, bulkItems: BulkItem[] }> {
    const bulkItems = cartItems.map(cartItem => ({
      entity: cartItem.typedEntity,
      properties: cartItem.parameterCategoryColumns.map(item => new BaseCdr(item.column)),
      additionalInfo: cartItem.typedEntity.UID_PersonOrdered.Column.GetDisplayValue(),
      status: BulkItemStatus.unknown
    }));

    const submit = await this.sidesheetService.open(
      ServiceItemEditComponent,
      {
        title: await this.translateService.get('#LDS#Heading Request Details').toPromise(),
        width: '750px',
        padding: '0px',
        data: bulkItems,
        testId: 'new-request-service-item-edit-sidesheet',
        disableClose: true,
      }).afterClosed().toPromise();

    return {
      bulkItems,
      submit
    };
  }
}
