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

import { Component, Inject, OnDestroy } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { PortalItshopRequests } from 'imx-api-qer';
import { ColumnDependentReference, DataSourceToolbarSettings } from 'qbm';
import { RequestHistoryService } from '../request-history.service';
import { EntitySchema } from 'imx-qbm-dbts';
import { ServiceItemsService } from '../../service-items/service-items.service';

@Component({
  templateUrl: './request-action.component.html',
  styleUrls: ['./request-action.component.scss']
})
export class RequestActionComponent implements OnDestroy {
  public readonly requestsDst: DataSourceToolbarSettings;
  public readonly serviceItemEntitySchema: EntitySchema;
  public readonly entitySchema: EntitySchema;
  public readonly formGroup = new UntypedFormGroup({});
  public invalidProlongationDate = false;
  public invalidUnsubscriptionDate = false;

  private readonly subscribers: Subscription[] = [];

  constructor(
    public readonly sidesheet: EuiSidesheetRef,
    requestHistoryService: RequestHistoryService,
    serviceItemsService: ServiceItemsService,
    @Inject(EUI_SIDESHEET_DATA) public readonly data: {
      description: string,
      reason: ColumnDependentReference,
      justification?: ColumnDependentReference,
      prolongation?: ColumnDependentReference,
      unsubscription?: ColumnDependentReference,
      requests: PortalItshopRequests[]
    }
  ) {
    this.serviceItemEntitySchema = serviceItemsService.PortalShopServiceItemsSchema;
    this.entitySchema = requestHistoryService.PortalItshopRequestsSchema;

    const displayedColumns = [
      this.entitySchema.Columns.DisplayOrg,
      this.entitySchema.Columns.OrderDate,
      this.entitySchema.Columns.ValidUntil
    ];

    if (this.data.prolongation && this.data.requests.some(request => request.MaxValidDays.value > 0)) {
      displayedColumns.push(this.entitySchema.Columns.MaxValidDays);
    }

    this.requestsDst = {
      dataSource: {
        totalCount: this.data.requests.length,
        Data: this.data.requests,
      },
      entitySchema: this.entitySchema,
      navigationState: {},
      displayedColumns
    };
  }

  public ngOnDestroy(): void {
    this.subscribers.forEach(s => s.unsubscribe());
  }

  public addProlongationMaxValidDaysCheck(control: AbstractControl): void {
    this.subscribers.push(control.valueChanges.subscribe(value =>
      this.invalidProlongationDate = value != null && this.data.requests.some(request => {
        if (request.MaxValidDays.value === 0) {
          return false;
        }

        const maxDate = new Date(request.OrderDate.value);
        maxDate.setDate(maxDate.getDate() + request.MaxValidDays.value);
        return new Date(value).valueOf() > maxDate.valueOf();
      })
    ));
  }

  public addUnsubscribeMaxValidDaysCheck(control: AbstractControl): void {
    this.subscribers.push(control.valueChanges.subscribe(value =>
      this.invalidUnsubscriptionDate = value != null && this.data.requests.some(request =>
        request.ValidUntil.value != null && new Date(value).valueOf() > new Date(request.ValidUntil.value).valueOf()
      ))
    );
  }
}
