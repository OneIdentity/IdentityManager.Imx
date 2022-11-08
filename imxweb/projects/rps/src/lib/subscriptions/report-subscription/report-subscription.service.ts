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
 * Copyright 2022 One Identity LLC.
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

import { Injectable } from '@angular/core';

import { PortalReports, PortalSubscriptionInteractive } from 'imx-api-rps';
import { CollectionLoadParameters, EntitySchema, FkProviderItem, ParameterData, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { ParameterDataService } from 'qer';
import { RpsApiService } from '../../rps-api-client.service';
import { ReportSubscription } from './report-subscription';

@Injectable({
  providedIn: 'root'
})
export class ReportSubscriptionService {

  constructor(
    private readonly api: RpsApiService,
    private readonly parameterDataService: ParameterDataService) { }

  public get PortalSubscriptionInteractiveSchema(): EntitySchema {
    return this.api.typedClient.PortalSubscriptionInteractive.GetSchema();
  }

  public getReportCandidates(parameter: CollectionLoadParameters)
    : Promise<TypedEntityCollectionData<PortalReports>> {
    return this.api.typedClient.PortalReports.Get(parameter);
  }

  public buildRpsSubscription(subscription: PortalSubscriptionInteractive): ReportSubscription {
    return new ReportSubscription(subscription,
      (entity, data) => this.getFkProviderItems(entity, data),
      this.parameterDataService);
  }

  public async createNewSubscription(uidReport: string): Promise<ReportSubscription> {

    const subscription = await this.api.typedClient.PortalSubscriptionInteractive.Get();
    await subscription.Data[0].UID_RPSReport.Column.PutValue(uidReport);
    await subscription.Data[0].Ident_RPSSubscription.Column.PutValue(subscription.Data[0].UID_RPSReport.Column.GetDisplayValue());
    const allowedFormats = subscription.Data[0].ExportFormat.Column.GetMetadata().GetLimitedValues();
    if (allowedFormats && allowedFormats.filter(f => f.Value == 'PDF').length > 0) {
      await subscription.Data[0].ExportFormat.Column.PutValue('PDF');
    }

    return this.buildRpsSubscription(subscription.Data[0]);
  }

  private getFkProviderItems(subscription: PortalSubscriptionInteractive, parameterData: ParameterData): FkProviderItem[] {
    if (parameterData.Property.FkRelation) {
      return [
        this.getFkProviderItem(subscription, parameterData.Property.ColumnName, parameterData.Property.FkRelation.ParentTableName)
      ];
    }

    if (parameterData.Property.ValidReferencedTables) {
      return parameterData.Property.ValidReferencedTables.map(parentTableRef =>
        this.getFkProviderItem(subscription, parameterData.Property.ColumnName, parentTableRef.TableName)
      );
    }

    // no candidates
    return [];
  }

  private getFkProviderItem(subscription: PortalSubscriptionInteractive, columnName: string, fkTableName: string): FkProviderItem {
    return {
      columnName,
      fkTableName,
      parameterNames: [
        'OrderBy',
        'StartIndex',
        'PageSize',
        'filter',
        'withProperties',
        'search'
      ],
      load: async (__entity, parameters?) => {
        return this.api.client.portal_subscription_interactive_parameter_candidates_post(
          columnName,
          fkTableName,
          subscription.InteractiveEntityWriteData,
          parameters
        );
      },
      getDataModel: async () => ({}),
      getFilterTree: async (__entity, parentkey) => {
        return this.api.client.portal_subscription_interactive_parameter_candidates_filtertree_post(
          columnName, fkTableName, subscription.InteractiveEntityWriteData, { parentkey }
        );
      }
    };
  }
}
