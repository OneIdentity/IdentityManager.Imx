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

import { Component, Inject, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalApplicationIdentitiesbyidentity } from '@imx-modules/imx-api-aob';
import {
  CollectionLoadParameters,
  DisplayColumns,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IClientProperty,
} from '@imx-modules/imx-qbm-dbts';
import { DataSourceToolbarSettings, DataViewSource, ImxTranslationProviderService } from 'qbm';
import { IdentityDetailData } from '../identity-detail-data';
import { IdentityService } from '../identity.service';

@Component({
  selector: 'imx-identity-detail',
  templateUrl: './identity-detail.component.html',
  styleUrls: ['./identity-detail.component.scss'],
  providers: [DataViewSource],
})
export class IdentityDetailComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters;
  public DisplayColumns = DisplayColumns;
  public entitySchema: EntitySchema;
  public displayedColumns: IClientProperty[];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: IdentityDetailData,
    private readonly identityService: IdentityService,
    public readonly translateProvider: ImxTranslationProviderService,
    public dataSource: DataViewSource<PortalApplicationIdentitiesbyidentity>,
  ) {
    this.entitySchema = this.identityService.getByIdentitySchema();
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchema.Columns['OrderState'],
      this.entitySchema.Columns['ValidUntil'],
    ];
  }

  public async ngOnInit(): Promise<void> {
    this.dataSource.init({
      execute: (params: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalApplicationIdentitiesbyidentity, unknown>> =>
        this.identityService.getByIdentity(
          this.data.application.GetEntity().GetKeys()[0],
          this.data.selectedItem?.GetEntity().GetKeys()[0] || '',
          params,
        ),
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
    });
  }
}
