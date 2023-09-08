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

import { EventEmitter } from '@angular/core';

import { PortalSubscription } from 'imx-api-rps';
import { IFkCandidateProvider, IClientProperty, IEntityColumn, ParameterData } from 'imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference, ImxTranslationProviderService } from 'qbm';
import { ParameterDataService } from 'qer';

import { ReportParameterWrapper } from './report-parameter-wrapper';

export class ReportSubscription {
  public readonly columnsWithParameterReload = ['UID_RPSReport'];
  public reportEntityWrapper: ReportParameterWrapper;
  public readonly hasParameter: boolean;

  private parameterColumns: IEntityColumn[] = [];

  public startWriteData = new EventEmitter<string>();
  public endWriteData = new EventEmitter<void>();

  constructor(
    public subscription: PortalSubscription,
    translationService: ImxTranslationProviderService,
    private getFkProviderItem: (cartItem: PortalSubscription, parameter: ParameterData) => IFkCandidateProvider,
    parameterDataService: ParameterDataService
  ) {
    this.reportEntityWrapper = new ReportParameterWrapper(
      translationService,
      parameterDataService.logger,
      this.subscription?.extendedDataRead?.length ? this.subscription.extendedDataRead[0] : null,
      (parameterData) => this.getFkProviderItem(this.subscription, parameterData),
      this.subscription
    );
    this.hasParameter = this.subscription?.extendedDataRead?.[0]?.length > 0;

    this.parameterColumns = this.hasParameter ? this.reportEntityWrapper.columns : [];

    this.reportEntityWrapper.startWriteData.subscribe((elem) => this.startWriteData.emit(elem));
    this.reportEntityWrapper.endWriteData.subscribe(() => this.endWriteData.emit());
  }

  public getCdrs(properties: IClientProperty[]): ColumnDependentReference[] {
    if (!this.subscription) {
      return [];
    }

    const columns =
      properties.length === 0
        ? [
            this.subscription.Ident_RPSSubscription.Column,
            this.subscription.UID_RPSReport.Column,
            this.subscription.UID_DialogSchedule.Column,
            this.subscription.ExportFormat.Column,
            this.subscription.AddtlSubscribers.Column,
          ]
        : properties.map((prop) => this.subscription.GetEntity().GetColumn(prop.ColumnName));

    return columns.map((col) => new BaseCdr(col));
  }

  public getParameterCdr(): ColumnDependentReference[] {
    return this.parameterColumns.map((col) => new BaseCdr(col));
  }

  public getParameterDictionary(): { [key: string]: any } {
    const ret = {};
    this.parameterColumns.forEach((elem) => (ret[elem.ColumnName] = elem.GetValue()));

    return ret;
  }

  public getDisplayableColums(): IEntityColumn[] {
    return [
      this.subscription.Ident_RPSSubscription.Column,
      this.subscription.UID_RPSReport.Column,
      this.subscription.UID_DialogSchedule.Column,
      this.subscription.ExportFormat.Column,
      this.subscription.AddtlSubscribers.Column,
    ].concat(this.parameterColumns);
  }

  public async submit(reload:boolean = false): Promise<void> {
    this.subscription.extendedData = [this.parameterColumns.map((col) => ({ Name: col.ColumnName, Value: col.GetValue() }))];

    return this.subscription.GetEntity().Commit(reload);
  }

  public unsubscribeEvents(): void {
    this.reportEntityWrapper.endWriteData.unsubscribe();
    this.reportEntityWrapper.startWriteData.unsubscribe();
    this.reportEntityWrapper.unsubscribeEvents();
  }
}
