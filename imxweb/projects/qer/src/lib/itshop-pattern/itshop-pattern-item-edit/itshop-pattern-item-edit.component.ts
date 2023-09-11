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

import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalItshopPatternItem } from 'imx-api-qer';

import { DisplayColumns, IEntityColumn } from 'imx-qbm-dbts';
import { BaseReadonlyCdr, ClassloggerService, ColumnDependentReference } from 'qbm';
import { ExtendedEntityWrapper } from '../../parameter-data/extended-entity-wrapper.interface';

import { ItshopPatternService } from '../itshop-pattern.service';
import { ItshopPatternItemEditParameter } from './itshop-pattern-item-edit-parameter.interface';

@Component({
  selector: 'imx-itshop-pattern-item-edit',
  templateUrl: './itshop-pattern-item-edit.component.html',
  styleUrls: ['./itshop-pattern-item-edit.component.scss']
})
export class ItshopPatternItemEditComponent implements OnInit {
  public readonly requestParamForm = new FormGroup({});
  public columns: IEntityColumn[];

  public cdrList: ColumnDependentReference[] = [];
  public detailsInfoText = '#LDS#Here you can see the details of the product. Additionally, you can pre-fill the values of the request parameters.';

  public loadingParams = true;
  public hasParams: boolean = true;

  private entityWrapper: ExtendedEntityWrapper<PortalItshopPatternItem>;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) private readonly data: ItshopPatternItemEditParameter,
    private readonly sideSheetRef: EuiSidesheetRef,
    private readonly patternService: ItshopPatternService,
    private readonly logger: ClassloggerService,
  ) { }

  public async ngOnInit(): Promise<void> {
    const properties = this.data.projectConfig.ITShopConfig.AccProductProperties;
    this.cdrList = [
      new BaseReadonlyCdr(this.data.serviceItem.GetEntity().GetColumn(DisplayColumns.DISPLAY_PROPERTYNAME)),
      new BaseReadonlyCdr(this.data.serviceItem.TableName.Column),
      new BaseReadonlyCdr(this.data.serviceItem.Tags.Column),
      ...properties.map((prop: string) => new BaseReadonlyCdr(this.data.serviceItem.GetEntity().GetColumn(prop)))
    ];

    this.entityWrapper = await this.patternService.getInteractivePatternitem(this.data.patternItemUid);
    this.columns = this.entityWrapper.parameterCategoryColumns.map(item => item.column);
    this.hasParams = this.entityWrapper.parameterCategoryColumns?.length > 0;
    this.loadingParams = false;
  }

  public async save() {
    this.patternService.handleOpenLoader();
    try {
      await this.patternService.save(this.entityWrapper);
      this.logger.debug(this, 'data of itshop pattern item is saved.');
    } finally {
      this.patternService.handleCloseLoader();
    }
    this.sideSheetRef.close(true)
  }
}
