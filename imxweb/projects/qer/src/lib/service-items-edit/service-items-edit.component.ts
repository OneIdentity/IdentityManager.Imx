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

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalServiceitems } from 'imx-api-qer';

import { CollectionLoadParameters, DisplayColumns, ValType } from 'imx-qbm-dbts';

import { DataSourceToolbarSettings, UserMessageService, DataSourceWrapper, BusyService } from 'qbm';
import { ServiceItemsEditSidesheetComponent } from './service-items-edit-sidesheet/service-items-edit-sidesheet.component';
import { ServiceItemsEditService } from './service-items-edit.service';

@Component({
  selector: 'imx-service-items-edit',
  templateUrl: './service-items-edit.component.html',
  styleUrls: ['./service-items-edit.component.scss'],
})
export class ServiceItemsEditComponent implements OnInit {
  public readonly dstWrapper: DataSourceWrapper<PortalServiceitems>;
  public dstSettings: DataSourceToolbarSettings;
  public busyService = new BusyService();

  @Input() public isAdmin: boolean;

  constructor(
    private readonly serviceItemsEditService: ServiceItemsEditService,
    private readonly route: ActivatedRoute,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly messageService: UserMessageService
  ) {
    this.isAdmin = this.route.snapshot.url[0].path === 'admin';
    const entitySchema = this.serviceItemsEditService.serviceitemsSchema;

    this.dstWrapper = new DataSourceWrapper(
      (state, requestOpts, isInitial) =>
        isInitial ? Promise.resolve({ totalCount: 0, Data: [] }) : this.serviceItemsEditService.get(state),
      [
        entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
        {
          ColumnName: 'Requestable',
          Type: ValType.String,
          afterAdditionals: true,
          untranslatedDisplay: '#LDS#Requestable',
        },
      ],
      entitySchema,
      undefined,
      'service-item-edit'
    );
  }

  public async ngOnInit(): Promise<void> {
    await this.getData(undefined, true);
  }

  public async getData(newState?: CollectionLoadParameters, isInitialLoad: boolean = false): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.dstSettings = await this.dstWrapper.getDstSettings(newState, undefined, isInitialLoad);
    } finally {
      isBusy.endBusy();
    }
  }

  public async onHighlightedEntityChanged(selectedItem: PortalServiceitems): Promise<void> {
    await this.viewDetails(selectedItem);
  }

  private async viewDetails(serviceItem: PortalServiceitems): Promise<void> {
    if (serviceItem) {
      const key = serviceItem.GetEntity().GetKeys().join(',');
      const serviceItemInteractive = await this.serviceItemsEditService.getServiceItem(key);

      const result = await this.sideSheet
        .open(ServiceItemsEditSidesheetComponent, {
          title: await this.translate.get('#LDS#Heading Edit Service Item').toPromise(),
          subTitle: serviceItem.GetEntity().GetDisplay(),
          padding: '0',
          width: 'max(600px, 60%)',
          disableClose: true,
          testId: 'serviceItems-details-sidesheet',
          data: serviceItemInteractive,
        })
        .afterClosed()
        .toPromise();

      if (result) {
        this.getData();
      }
    } else {
      this.messageService.subject.next({
        text: '#LDS#You cannot edit the service item. The service item does not exist (anymore). Please reload the page.',
      });
    }
  }
}
