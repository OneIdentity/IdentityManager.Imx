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

import { PortalSubscriptionInteractive } from 'imx-api-rps';
import { FkProviderItem, IClientProperty, IEntityColumn, ParameterData } from 'imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference } from 'qbm';
import { ParameterDataService } from 'qer';

export class ReportSubscription {

  public readonly columnsWithParameterReload = ["UID_RPSReport"];

  private parameterColumns: IEntityColumn[] = [];

  constructor(
    public subscription: PortalSubscriptionInteractive,
    private getFkProviderItem: (cartItem: PortalSubscriptionInteractive, parameter: ParameterData) => FkProviderItem[],
    private readonly parameterDataService: ParameterDataService,
  ) { }

  public getCdrs(properties: IClientProperty[]): ColumnDependentReference[] {
    if (this.subscription == null) {
      return [];
    }

    const columns = properties.length === 0 ? [
      this.subscription.Ident_RPSSubscription.Column,
      this.subscription.UID_RPSReport.Column,
      this.subscription.UID_DialogSchedule.Column,
      this.subscription.ExportFormat.Column,
      this.subscription.AddtlSubscribers.Column
    ]
      : properties.map(prop => this.subscription.GetEntity().GetColumn(prop.ColumnName));

    return columns.map(col => new BaseCdr(col));
  }

  public getParameterCdr(): ColumnDependentReference[] {

    this.parameterColumns = this.subscription == null || this.subscription.extendedDataRead.length <= 0 ? []
      : this.parameterDataService.createInteractiveParameterColumns(
        this.subscription.extendedDataRead[0],
        parameterData => this.getFkProviderItem(this.subscription, parameterData),
        this.subscription
      );
    return this.parameterColumns.map(col => new BaseCdr(col));
  }

  public getDisplayableColums(): IEntityColumn[] {
    return [
      this.subscription.Ident_RPSSubscription.Column,
      this.subscription.UID_RPSReport.Column,
      this.subscription.UID_DialogSchedule.Column,
      this.subscription.ExportFormat.Column,
      this.subscription.AddtlSubscribers.Column
    ].concat(this.parameterColumns == null ? [] : this.parameterColumns);
  }

  public async submit(): Promise<void> {
    if (this.parameterColumns) {
      this.subscription.extendedData = [
        this.parameterColumns.map(col => ({ Name: col.ColumnName, Value: col.GetValue() }))
      ];
    }

    return this.subscription.GetEntity().Commit(false);
  }
}
