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
 * Copyright 2024 One Identity LLC.
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
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { PortalServiceitems } from '@imx-modules/imx-api-qer';
import { TranslateService } from '@ngx-translate/core';

import {
  CollectionLoadParameters,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  TypedEntityCollectionData,
  ValType,
} from '@imx-modules/imx-qbm-dbts';

import { BusyService, DataViewInitParameters, DataViewSource, UserMessageService, calculateSidesheetWidth } from 'qbm';
import { ServiceItemsEditSidesheetComponent } from './service-items-edit-sidesheet/service-items-edit-sidesheet.component';
import { ServiceItemsEditService } from './service-items-edit.service';

@Component({
  selector: 'imx-service-items-edit',
  templateUrl: './service-items-edit.component.html',
  styleUrls: ['./service-items-edit.component.scss'],
  providers: [DataViewSource],
})
export class ServiceItemsEditComponent implements OnInit {
  public entitySchema: EntitySchema;
  public busyService = new BusyService();
  public displayedColumns: IClientProperty[];
  public readonly DisplayColumns = DisplayColumns;

  @Input() public isAdmin: boolean;

  constructor(
    private readonly serviceItemsEditService: ServiceItemsEditService,
    private readonly route: ActivatedRoute,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly loadingService: EuiLoadingService,
    private readonly messageService: UserMessageService,
    public dataSource: DataViewSource<PortalServiceitems>,
  ) {
    this.isAdmin = this.route.snapshot.url[0].path === 'admin';
    this.entitySchema = this.serviceItemsEditService.serviceitemsSchema;
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      {
        ColumnName: 'Requestable',
        Type: ValType.String,
      },
    ];
  }

  public async ngOnInit(): Promise<void> {
    await this.getData();
  }

  public getData(): void {
    const dataViewInitParameters: DataViewInitParameters<PortalServiceitems> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalServiceitems>> =>
        this.serviceItemsEditService.get(params, signal),
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      highlightEntity: (entity: PortalServiceitems) => {
        this.viewDetails(entity);
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }

  private async viewDetails(serviceItem: PortalServiceitems): Promise<void> {
    if (serviceItem) {
      const key = serviceItem.GetEntity().GetKeys().join(',');

      let serviceItemInteractive: PortalServiceitems | undefined = undefined;
      const overlay = this.loadingService.show();
      try {
        serviceItemInteractive = await this.serviceItemsEditService.getServiceItem(key);
      } finally {
        this.loadingService.hide(overlay);
      }

      if (serviceItemInteractive != null) {
        const result = await this.sideSheet
          .open(ServiceItemsEditSidesheetComponent, {
            title: await this.translate.get('#LDS#Heading Edit Service Item').toPromise(),
            subTitle: serviceItem.GetEntity().GetDisplay(),
            padding: '0',
            width: calculateSidesheetWidth(),
            disableClose: true,
            testId: 'serviceItems-details-sidesheet',
            data: serviceItemInteractive,
          })
          .afterClosed()
          .toPromise();

        if (result) {
          this.dataSource.updateState();
        }
      }
    } else {
      this.messageService.subject.next({
        text: '#LDS#You cannot edit the service item. The service item does not exist (anymore). Please reload the page.',
      });
    }
  }
}
