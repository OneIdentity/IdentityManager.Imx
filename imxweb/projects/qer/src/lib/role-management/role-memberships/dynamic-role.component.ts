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
 * Copyright 2021 One Identity LLC.
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

import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalDynamicgroupInteractive } from 'imx-api-qer';
import { SqlWizardExpression, IEntity, WriteExtTypedEntity, SqlExpression, isExpressionInvalid, LogOp } from 'imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference, ConfirmationService } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';
import { RoleService } from '../role.service';

@Component({
  templateUrl: './dynamic-role.component.html',
  styleUrls: ['./role-sidesheet-tabs.scss', './dynamic-role.component.scss'],
  selector: 'imx-dynamic-group',
})
export class DynamicRoleComponent implements OnInit {

  constructor(
    private readonly apiService: QerApiService,
    private readonly roleService: RoleService,
    private readonly translator: TranslateService,
    private readonly cdref: ChangeDetectorRef,
    private readonly confirmSvc: ConfirmationService,
    private readonly busyService: EuiLoadingService
  ) {}

  @Input() uidDynamicGroup: string;
  @Input() public isAdmin: boolean;
  @Input() public entity: IEntity;


  dynamicGroup: PortalDynamicgroupInteractive;

  sqlExpression: SqlWizardExpression;

  showHelperAlert = true;
  cdrList: ColumnDependentReference[] = [];
  busy = true;

  public async ngOnInit(): Promise<void> {
    await this.loadDynamicRole();
    // TODO: Save off initial state to check if we come back to this state and mark service as clean
  }

  public async save(): Promise<void> {
    try {
      this.busyService.show();
      if (this.dynamicGroup) {
        if (!this.sqlExpression.IsUnsupported) {
          this.dynamicGroup.extendedData = { Filters: [this.sqlExpression.Expression] };
        }
        await this.dynamicGroup.GetEntity().Commit(true);
      } else {
        const e = <WriteExtTypedEntity<{ NewDynamicRole: SqlExpression }>>(
          await this.roleService.getInteractive(this.entity.TypeName, this.entity.GetKeys()[0], this.isAdmin)
        );
        e.extendedData = { NewDynamicRole: this.sqlExpression.Expression };
        await e.GetEntity().Commit(true);
        this.uidDynamicGroup = e.GetEntity().GetColumn('UID_DynamicGroup').GetValue();
        await this.loadDynamicRole();
      }
    } finally {
      this.busyService.hide();
      this.roleService.autoMembershipDirty(false);
    }
  }

  public async createDynamic(): Promise<void> {
    this.sqlExpression = {
      Expression: {
        Expressions: [],
        LogOperator: LogOp.AND,
      },
    };
    this.cdref.detectChanges();
    this.roleService.autoMembershipDirty(true);
  }

  public async deleteDynamic(): Promise<void> {
    const title = await this.translator.get('#LDS#Heading Delete Dynamic Role').toPromise();
    // If there is no active dynamic role, no one will actually be removed
    var warningKey = this.uidDynamicGroup
      ? '#LDS#All members assigned by the dynamic role will be removed. Are you sure you want to delete the dynamic role?'
      : '#LDS#Are you sure you want to delete the dynamic role?';
    const message = await this.translator.get(warningKey).toPromise();

    const result = await this.confirmSvc.confirm({
      ShowYesNo: true,
      Title: title,
      Message: message,
    });
    if (!result) return;

    try {
      this.busyService.show();

      if (this.uidDynamicGroup) {
        await this.apiService.v2Client.portal_dynamicgroup_delete(this.uidDynamicGroup);
        this.uidDynamicGroup = null;
      }
      this.dynamicGroup = null;
      this.sqlExpression = null;
      this.roleService.autoMembershipDirty(false);
    } finally {
      this.busyService.hide();
    }
  }

  public isConditionInvalid(): boolean {
    return this.sqlExpression?.Expression?.Expressions.length === 0 || isExpressionInvalid(this.sqlExpression);
  }

  private async loadDynamicRole(): Promise<void> {
    try {
      this.busy = true;
      if (this.uidDynamicGroup) {
        const data = await this.apiService.typedClient.PortalDynamicgroupInteractive.Get(this.uidDynamicGroup);

        this.dynamicGroup = data.Data[0];
        this.sqlExpression = data.extendedData.Expressions[0];

        this.cdrList = [
          new BaseCdr(this.dynamicGroup.UID_DialogSchedule.Column),
          new BaseCdr(this.dynamicGroup.IsCalculateImmediately.Column),
        ];
      }
    } finally {
      this.busy = false;
    }
  }

  LdsUnsupportedExpression = '#LDS#You cannot edit these automatic memberships conditions in the Web Portal.';
  LdsNoDynamicRole =
    '#LDS#Currently, no identities automatically become members through a dynamic role. You can create a dynamic role through which identities automatically become members.';
  LdsWizardInfo = '#LDS#Identities automatically become members through this dynamic role if they meet the following conditions.';
}
