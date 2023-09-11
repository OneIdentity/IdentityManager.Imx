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
import { Injectable } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { ComplianceFeatureConfig, PortalRules, V2ApiClientMethodFactory } from 'imx-api-cpl';
import {  } from 'imx-api-cpl';
import { CollectionLoadParameters, DataModel, EntityCollectionData, EntitySchema, ExtendedTypedEntityCollection, MethodDefinition, MethodDescriptor } from 'imx-qbm-dbts';
import { AppConfigService, DataSourceToolbarExportMethod } from 'qbm';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class RulesService {
  private busyIndicator: OverlayRef;

  constructor(
    private apiservice: ApiService,
    private busyService: EuiLoadingService,
    private appConfig: AppConfigService
  ) { }

  public get ruleSchema(): EntitySchema {
    return this.apiservice.typedClient.PortalRules.GetSchema();
  }

  public async featureConfig(): Promise<ComplianceFeatureConfig> {
    return this.apiservice.client.portal_compliance_config_get();
  }

  public async getRules(parameter?: CollectionLoadParameters)
    : Promise<ExtendedTypedEntityCollection<PortalRules, unknown>> {
    return this.apiservice.typedClient.PortalRules.Get(parameter);
  }

  public exportRules(parameter: CollectionLoadParameters): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_rules_get({...parameter, withProperties, PageSize, StartIndex: 0})
        } else {
          method = factory.portal_rules_get({...parameter, withProperties})
        }
        return new MethodDefinition(method);
      }
    }
  }

  public async getDataModel(): Promise<DataModel> {
    return this.apiservice.client.portal_rules_datamodel_get();
  }

  public ruleReport(uidrule: string): string {
    const path = `rules/${uidrule}/report`;
    return `${this.appConfig.BaseUrl}/portal/${path}`;
  }

  public async recalculate(uidrule: string): Promise<void> {
    return this.apiservice.client.portal_rules_recalculate_post(uidrule);
  }

  public handleOpenLoader(): void {
    if (!this.busyIndicator) {
      this.busyIndicator = this.busyService.show();
    }
  }

  public handleCloseLoader(): void {
    if (this.busyIndicator) {
      setTimeout(() => {
        this.busyService.hide(this.busyIndicator);
        this.busyIndicator = undefined;
      });
    }
  }

}
