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
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetConfig, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { QerProjectConfig } from '@imx-modules/imx-api-qer';
import { CollectionLoadParameters, EntitySchema, FilterData, IClientProperty, TypedEntity } from '@imx-modules/imx-qbm-dbts';
import { calculateSidesheetWidth, DataSourceToolbarSettings, SettingsService } from 'qbm';
import { AddressbookDetailComponent } from '../../../addressbook/addressbook-detail/addressbook-detail.component';
import { AddressbookService } from '../../../addressbook/addressbook.service';
import { DuplicateCheckParameter } from '../duplicate-check-parameter.interface';

@Component({
  templateUrl: './duplicates-sidesheet.component.html',
  styleUrls: ['./duplicates-sidesheet.component.scss'],
})
export class DuplicatesSidesheetComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  private displayedColumns: IClientProperty[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      projectConfig: QerProjectConfig;
      get: (param: CollectionLoadParameters) => Promise<any>;
      getFilter: (filter: DuplicateCheckParameter) => FilterData[];
      duplicateParameter: DuplicateCheckParameter;
      entitySchema: EntitySchema;
    },
    public readonly settings: SettingsService,
    private readonly busy: EuiLoadingService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly addressbookService: AddressbookService,
    private readonly translateService: TranslateService,
  ) {
    this.displayedColumns = [
      data.entitySchema.Columns.DefaultEmailAddress,
      data.entitySchema.Columns.IdentityType,
      data.entitySchema.Columns.UID_Department,
      data.entitySchema.Columns.UID_Locality,
    ];
  }

  public async ngOnInit(): Promise<void> {
    await this.navigate({ PageSize: this.settings.DefaultPageSize });
  }

  public async navigate(parameter: CollectionLoadParameters): Promise<void> {
    const currentParameter = { ...parameter, ...{ filter: this.data.getFilter(this.data.duplicateParameter) } };

    if (this.busy.overlayRefs.length === 0) {
      this.busy.show();
    }
    try {
      const data = await this.data.get(currentParameter);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.data.entitySchema,
        navigationState: currentParameter,
      };
    } finally {
      this.busy.hide();
    }
  }

  public async onHighlightedEntityChanged(personAll: TypedEntity): Promise<void> {
    if (this.busy.overlayRefs.length === 0) {
      this.busy.show();
    }

    let config: EuiSidesheetConfig;

    try {
      config = {
        title: await this.translateService.get('#LDS#Heading View Identity Details').toPromise(),
        subTitle: personAll.GetEntity().GetDisplay(),
        padding: '0',
        width: calculateSidesheetWidth(),
        testId: 'duplicate-identity-detail-sidesheet',
        data: await this.addressbookService.getDetail(
          personAll,
          this.data.projectConfig.PersonConfig?.VI_MyData_WhitePages_DetailAttributes ?? [],
        ),
      };
    } finally {
      this.busy.hide();
    }

    this.sidesheet.open(AddressbookDetailComponent, config);
  }
}
