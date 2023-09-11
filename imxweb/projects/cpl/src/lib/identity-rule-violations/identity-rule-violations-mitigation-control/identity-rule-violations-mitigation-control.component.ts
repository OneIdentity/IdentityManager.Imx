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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Inject, OnInit } from '@angular/core';
import { EuiLoadingService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { CollectionLoadParameters, EntitySchema, ExtendedTypedEntityCollection, IClientProperty, TypedEntity } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings } from 'qbm';

@Component({
  selector: 'imx-identity-rule-violations-mitigation-control',
  templateUrl: './identity-rule-violations-mitigation-control.component.html',
  styleUrls: ['./identity-rule-violations-mitigation-control.component.scss']
})
export class IdentityRuleViolationsMitigationControlComponent implements OnInit {

  public dstSettings: DataSourceToolbarSettings;
  constructor(
    private readonly busy: EuiLoadingService,
    @Inject(EUI_SIDESHEET_DATA) public data: {
      getData: (param: CollectionLoadParameters) => Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>>,
      entitySchema: EntitySchema,
      displayedColumns: IClientProperty[]
    }
  ) { }

  public async ngOnInit(): Promise<void> {
    this.getData({});
  }

  public async onSearch(key: string): Promise<void> {
    return this.getData({ StartIndex: 0, search: key });
  }

  public async getData(param: CollectionLoadParameters): Promise<void> {
    let overlay: OverlayRef;

    setTimeout(() => { overlay = this.busy.show(); });

    try {

      const dataSource = await this.data.getData(param);
      this.dstSettings = {
        displayedColumns: this.data.displayedColumns,
        dataSource,
        entitySchema: this.data.entitySchema,
        navigationState: param
      };
    } finally {
      setTimeout(() => this.busy.hide(overlay));
    }

  }

}
