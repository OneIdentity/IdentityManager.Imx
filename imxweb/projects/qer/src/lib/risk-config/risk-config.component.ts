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

import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EuiSidesheetService } from '@elemental-ui/core';

import { PortalRiskFunctions } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, EntitySchema } from 'imx-qbm-dbts';
import {
  BusyService,
  DataModelWrapper,
  DataSourceToolbarSettings,
  DataSourceWrapper,
  SnackBarService,
  HelpContextualComponent,
  HelpContextualService,
  HELP_CONTEXTUAL,
} from 'qbm';
import { RiskConfigSidesheetComponent } from './risk-config-sidesheet/risk-config-sidesheet.component';
import { RiskConfigService } from './risk-config.service';

@Component({
  selector: 'imx-risk-config',
  templateUrl: './risk-config.component.html',
  styleUrls: ['./risk-config.component.scss'],
})
export class RiskConfigComponent implements OnInit {
  public dstWrapper: DataSourceWrapper<PortalRiskFunctions>;
  public dstSettings: DataSourceToolbarSettings;
  public dataModelWrapper: DataModelWrapper;
  public entitySchema: EntitySchema;
  public recalculatingInProcess = false;
  public DisplayColumns = DisplayColumns;
  public busyService = new BusyService();

  constructor(
    private readonly riskConfigService: RiskConfigService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly snackbar: SnackBarService,
    private readonly helpContextualService: HelpContextualService
  ) {
    this.entitySchema = this.riskConfigService.riskFunctionsSchema;
  }
  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.dataModelWrapper = {
        dataModel: await this.riskConfigService.getDataModel(),
      };

      this.dstWrapper = new DataSourceWrapper(
        (state, requestOpts, isInitial) => (isInitial ? Promise.resolve({ totalCount: 0, Data: [] }) : this.riskConfigService.get(state)),
        [
          this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
          this.entitySchema.Columns.TargetTable,
          this.entitySchema.Columns.Description,
          this.entitySchema.Columns.IsInActive,
          this.entitySchema.Columns.IsExecuteImmediate,
          this.entitySchema.Columns.Weight,
        ],
        this.entitySchema,
        this.dataModelWrapper,
        'risk-config'
      );
    } finally {
      isBusy.endBusy();
    }

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

  public async onHighlightedEntityChanged(riskFunctionSelected: PortalRiskFunctions): Promise<void> {
    if (riskFunctionSelected) {
      setTimeout(() => this.riskConfigService.handleOpenLoader());
      try {
        const key = riskFunctionSelected.GetEntity().GetKeys().join(',');
        const extendedEntity = await this.riskConfigService.getPortalRiskEntity(key);
        this.helpContextualService.setHelpContextId(HELP_CONTEXTUAL.ConfigurationRiskEdit);
        const result = await this.sideSheet
          .open(RiskConfigSidesheetComponent, {
            title: await this.translate.get('#LDS#Heading Edit Risk Index Function').toPromise(),
            subTitle: riskFunctionSelected.GetEntity().GetDisplay(),
            padding: '0',
            width: 'max(600px, 60%)',
            disableClose: true,
            testId: 'risk-config-sidesheet',
            data: {
              riskFunction: extendedEntity.Data[0],
              extendedData: extendedEntity.extendedData,
            },
            headerComponent: HelpContextualComponent,
          })
          .afterClosed()
          .toPromise();

        if (result) {
          this.getData();
        }
      } finally {
        setTimeout(() => this.riskConfigService.handleCloseLoader());
      }
    }
  }

  public async onRecalculate(): Promise<void> {
    this.recalculatingInProcess = true;
    this.snackbar.open({ key: '#LDS#The risk index recalculation has been successfully started.' });
    try {
      await this.riskConfigService.postRiskRecalculate().then(() => {
        this.getData();
      });
    } finally {
      this.recalculatingInProcess = false;
    }
  }
}
