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

import { Component, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalRiskFunctions } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import {
  BusyService,
  DataViewInitParameters,
  DataViewSource,
  HELP_CONTEXTUAL,
  HelpContextualComponent,
  HelpContextualService,
  SnackBarService,
  calculateSidesheetWidth,
} from 'qbm';
import { RiskConfigSidesheetComponent } from './risk-config-sidesheet/risk-config-sidesheet.component';
import { RiskConfigService } from './risk-config.service';

@Component({
  selector: 'imx-risk-config',
  templateUrl: './risk-config.component.html',
  styleUrls: ['./risk-config.component.scss'],
  providers: [DataViewSource],
})
export class RiskConfigComponent implements OnInit {
  public entitySchema: EntitySchema;
  public recalculatingInProcess = false;
  public DisplayColumns = DisplayColumns;
  public busyService = new BusyService();
  public displayedColumns: IClientProperty[];
  public dataModel: DataModel;

  constructor(
    private readonly riskConfigService: RiskConfigService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly snackbar: SnackBarService,
    private readonly helpContextualService: HelpContextualService,
    public dataSource: DataViewSource<PortalRiskFunctions>,
  ) {
    this.entitySchema = this.riskConfigService.riskFunctionsSchema;
  }
  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.dataModel = await this.riskConfigService.getDataModel();
      this.displayedColumns = [
        this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
        this.entitySchema.Columns.TargetTable,
        this.entitySchema.Columns.Description,
        this.entitySchema.Columns.IsInActive,
        this.entitySchema.Columns.Weight,
      ];
    } finally {
      isBusy.endBusy();
    }

    this.getData();
  }

  public getData(): void {
    const dataViewInitParameters: DataViewInitParameters<PortalRiskFunctions> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalRiskFunctions>> =>
        this.riskConfigService.get(params, signal),
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      dataModel: this.dataModel,
      highlightEntity: (entity: PortalRiskFunctions) => {
        this.onHighlightedEntityChanged(entity);
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }

  public async onHighlightedEntityChanged(riskFunctionSelected: PortalRiskFunctions): Promise<void> {
    if (!riskFunctionSelected) {
      return;
    }
    this.riskConfigService.handleOpenLoader();
    const key = riskFunctionSelected.GetEntity().GetKeys().join(',');
    const extendedEntity = await this.riskConfigService.getPortalRiskEntity(key);
    this.helpContextualService.setHelpContextId(HELP_CONTEXTUAL.ConfigurationRiskEdit);
    this.riskConfigService.handleCloseLoader();
    const result = await this.sideSheet
      .open(RiskConfigSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading Edit Risk Index Function').toPromise(),
        subTitle: riskFunctionSelected.GetEntity().GetDisplay(),
        padding: '0',
        width: calculateSidesheetWidth(),
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
      this.dataSource.updateState();
    }
  }

  public async onRecalculate(): Promise<void> {
    this.recalculatingInProcess = true;
    this.snackbar.open({ key: '#LDS#The risk index recalculation has been successfully started.' });
    try {
      await this.riskConfigService.postRiskRecalculate().then(() => {
        this.dataSource.updateState();
      });
    } finally {
      this.recalculatingInProcess = false;
    }
  }
}
