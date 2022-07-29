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

import { Component, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { ObjectSheetInterface, ClassloggerService } from 'qbm';
import { DbObjectKey, IClientProperty, IEntity, IEntityColumn } from 'imx-qbm-dbts';
import { EuiLoadingService } from '@elemental-ui/core';
import { UserModelService, QerApiService } from 'qer';

@Component({
  styleUrls: ['./unsgroup.component.scss'],
  templateUrl: './unsgroup.component.html'
})
export class UnsGroupObjectSheetComponent implements ObjectSheetInterface, OnInit, OnChanges {
  public objectKey: DbObjectKey;
  public object: IEntity;

  public detailProperties: IEntityColumn[] = [];
  private isAdmin: boolean;
  private isManager: boolean;

  constructor(
    private readonly qerClient: QerApiService,
    private readonly loading: EuiLoadingService,
    private userModelSvc: UserModelService,
    private readonly logger: ClassloggerService) {
    this.logger.debug(this, '▶️ UnsGroupObjectSheetComponent created');
  }


  public async ngOnInit(): Promise<void> {
    this.logger.debug(this, '▶️ UnsGroupObjectSheetComponent initializing');
    try {
      this.loading.show();

      this.userModelSvc.getUserConfig().then(d => this.IsHistoryActive = d.IsHistoryActive);

      await this.load();
    } finally {
      this.loading.hide();
    }
  }

  public async ngOnChanges(changes: SimpleChanges) {
    if (changes.objectKey) {
      await this.load();
    }
  }

  private async load() {
    const result = await this.qerClient.typedClient.PortalView.Get(this.objectKey.TableName,
      this.objectKey.Keys.join(','));
    this.isAdmin = result.Data[0].IsAdmin.value;
    this.isManager = result.Data[0].IsOwner.value;
    this.object = result.Data[0].GetEntity();
    const properties = <IClientProperty[]>result.extendedData;
    if (properties) {
      this.object.AddColumns(properties);
      this.detailProperties = properties.map(colName => this.object.GetColumn(colName.ColumnName));
    }
  }

  public IsHistoryActive: boolean;

  public IsEditEffective() {
    return this.isAdmin || this.isManager;
  }

  public Action12(): void {

  }


  public Action13(): void {
    // TODO show ObjectEdit for this entitlement - plus the service item
  }


  public Action14(): void {
  }


  public AssignOwners(): void {

  }


  public GoToHistory(): void {

  }


  public Action18(): void {

    // TODO go to usage
  }
}
