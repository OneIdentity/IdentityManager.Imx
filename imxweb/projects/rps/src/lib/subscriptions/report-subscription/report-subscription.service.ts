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

import { ElementRef, Injectable, Injector } from '@angular/core';

import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { EuiDownloadDirective, EuiDownloadService } from '@elemental-ui/core';
import { PortalReports, PortalSubscription, V2ApiClientMethodFactory } from '@imx-modules/imx-api-rps';
import {
  CollectionLoadParameters,
  EntitySchema,
  ExtendedTypedEntityCollection,
  FkProviderItem,
  IFkCandidateProvider,
  MethodDefinition,
  ParameterData,
  TypedEntityBuilder,
} from '@imx-modules/imx-qbm-dbts';
import { AppConfigService, ElementalUiConfigService, ImxTranslationProviderService } from 'qbm';
import { ParameterDataService } from 'qer';
import { RpsApiService } from '../../rps-api-client.service';
import { ReportSubscription } from './report-subscription';

@Injectable({
  providedIn: 'root',
})
export class ReportSubscriptionService {
  private readonly apiMethodFactory: V2ApiClientMethodFactory = new V2ApiClientMethodFactory();

  constructor(
    private readonly api: RpsApiService,
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly config: AppConfigService,
    private readonly http: HttpClient,
    private readonly overlay: Overlay,
    private readonly injector: Injector,
    private readonly translator: ImxTranslationProviderService,
    private readonly parameterDataService: ParameterDataService,
    private readonly downloadService: EuiDownloadService,
  ) {}

  public get PortalSubscriptionInteractiveSchema(): EntitySchema {
    return this.api.typedClient.PortalSubscriptionInteractive.GetSchema();
  }

  public async getReportCandidates(parameter: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalReports, unknown>> {
    const candidates = await this.api.client.portal_subscription_interactive_UID_RPSReport_candidates_get(parameter);
    const reportBuilder = new TypedEntityBuilder(PortalReports);
    return reportBuilder.buildReadWriteEntities(candidates, this.api.typedClient.PortalReports.GetSchema());
  }

  public buildRpsSubscription(subscription: PortalSubscription): ReportSubscription {
    return new ReportSubscription(
      subscription,
      this.translator,
      (entity, data) => this.getFkProvider(entity, data),
      this.parameterDataService,
    );
  }

  public async createNewSubscription(uidReport: string, suffix?: string): Promise<ReportSubscription> {
    const subscription = await this.api.typedClient.PortalSubscriptionInteractive.Get();
    await subscription.Data[0].UID_RPSReport.Column.PutValue(uidReport);
    await subscription.Data[0].Ident_RPSSubscription.Column.PutValue(subscription.Data[0].UID_RPSReport.Column.GetDisplayValue() + (suffix ?? ''),
    );
    const allowedFormats = subscription.Data[0].ExportFormat.Column.GetMetadata().GetLimitedValues();
    if (allowedFormats && allowedFormats.filter((f) => f.Value == 'PDF').length > 0) {
      await subscription.Data[0].ExportFormat.Column.PutValue('PDF');
    }

    return this.buildRpsSubscription(subscription.Data[0]);
  }

  public downloadSubsciption(subscription: ReportSubscription): void {
    const parameters = subscription.subscription.enrichMethodCallParameters();
    const def = new MethodDefinition(this.apiMethodFactory.portal_subscription_interactive_report_get(parameters.entityid, parameters));

    // not pretty, but the download directive does not support dynamic URLs
    const directive = new EuiDownloadDirective(
      new ElementRef('') /* no element */,
      this.http,
      this.overlay,
      this.injector,
      this.downloadService,
    );
    directive.downloadOptions = {
      ...this.elementalUiConfigService.Config.downloadOptions,
      fileMimeType: '', // override elementalUiConfigService; get mime type from server
      url: this.config.BaseUrl + def.path,
      disableElement: false,
    };
    // start the report download
    directive.onClick();
  }

  private getFkProvider(subscription: PortalSubscription, parameterData: ParameterData): IFkCandidateProvider {
    var api = this.api;
    return new (class implements IFkCandidateProvider {
      getProviderItem(_columnName, fkTableName): FkProviderItem {
        if (parameterData?.Property?.FkRelation) {
          return this.getFkProviderItem(
            subscription,
            _columnName,
            parameterData?.Property?.FkRelation?.ParentTableName,
            parameterData?.Property?.FkRelation?.ParentColumnName,
          );
        }

        if (parameterData?.Property?.ValidReferencedTables) {
          const t = parameterData.Property.ValidReferencedTables.map((parentTableRef) =>
            this.getFkProviderItem(subscription, parameterData?.Property?.ColumnName, parentTableRef?.TableName, 'XObjectKey'),
          ).filter((t) => t.fkTableName == fkTableName);
          if (t.length == 1) return t[0];
        }
        return this.getFkProviderItem(subscription);
      }

      private getFkProviderItem(
        subscription: PortalSubscription,
        columnName: string | undefined = '',
        fkTableName: string | undefined = '',
        fkColumnName: string | undefined = '',
      ): FkProviderItem {
        return {
          columnName,
          fkTableName,
          fkColumnName,
          parameterNames: ['OrderBy', 'StartIndex', 'PageSize', 'filter', 'withProperties', 'search'],
          load: async (__entity, parameters?) => {
            return api.client.portal_subscription_interactive_parameter_candidates_post(
              columnName,
              fkTableName,
              subscription.InteractiveEntityWriteData,
              parameters,
            );
          },
          getDataModel: async () => ({}),
          getFilterTree: async (__entity, parentkey) => {
            return api.client.portal_subscription_interactive_parameter_candidates_filtertree_post(
              columnName,
              fkTableName,
              subscription.InteractiveEntityWriteData,
              { parentkey },
            );
          },
        };
      }
    })();
  }

  public async sendViaMail(uid: string): Promise<void>{
    return this.api.client.portal_subscription_sendmail_post(uid);
  }
}
