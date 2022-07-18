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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit, Input } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';

import { BaseReadonlyCdr, ClassloggerService, ColumnDependentReference, ExtService, IExtension, TabControlHelper } from 'qbm';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { ApproverContainer } from './approver-container';
import { ItshopService } from '../itshop.service';
import { RequestParameterDataEntity } from './request-parameter-data-entity.interface';
import { WorkflowHistoryItemWrapper } from './workflow-history-item-wrapper';
import { DecisionHistoryService } from '../decision-history.service';
import { ServiceItemsService } from '../../service-items/service-items.service';
import { PortalShopServiceitems, QerProjectConfig } from 'imx-api-qer';

@Component({
  templateUrl: './request-info.component.html',
  selector: 'imx-requestinfo',
  styleUrls: ['./request-info.component.scss'],
})
export class RequestInfoComponent implements OnInit {
  @Input() public isReadOnly: boolean; // TODO later: an einer passenden Stelle verarbeiten
  @Input() public request: RequestParameterDataEntity;
  @Input() public userId: string;

  public parameters: BaseReadonlyCdr[];
  public propertyInfo: ColumnDependentReference[];
  public approverContainer: ApproverContainer;
  public workflow: WorkflowHistoryItemWrapper[];
  public readonly ruleViolationDetailId = 'cpl.ruleViolationDetail';
  public extensions: IExtension[] = [];
  public serviceItem: PortalShopServiceitems;
  public projectConfig: QerProjectConfig;
  public isRoleAssignment: boolean;

  constructor(
    private readonly projectConfigService: ProjectConfigurationService,
    private readonly logger: ClassloggerService,
    private readonly busyService: EuiLoadingService,
    private readonly itshopService: ItshopService,
    private readonly decisionHistory: DecisionHistoryService,
    private readonly ext: ExtService
  ) {
    this.extensions = this.ext.Registry[this.ruleViolationDetailId];
  }

  public async ngOnInit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    try {
      this.projectConfig = await this.projectConfigService.getConfig();
      this.propertyInfo =
        this.request == null || this.request.propertyInfo == null ? [] : this.request.propertyInfo.filter((elem) => this.isForView(elem));

      this.parameters = this.request.parameterColumns.map((column) => new BaseReadonlyCdr(column));

      this.approverContainer = new ApproverContainer(
        {
          decisionLevel: this.request.DecisionLevel.value,
          qerWorkingMethod: this.request.UID_QERWorkingMethod.value,
          isInWorkflow: ['OrderProduct', 'OrderUnsubscribe', 'OrderProlongate'].includes(this.request.UiOrderState.value),
          pwoData: this.request.pwoData,
          approvers: (await this.itshopService.getApprovers(this.request.GetEntity().GetKeys()[0])).Data.map(
            (elem) => elem.UID_Person.value
          ),
        },
        this.projectConfig.ITShopConfig,
        this.logger
      );

      this.workflow = this.itshopService
        .createTypedHistory(this.request.pwoData)
        .map((item) => new WorkflowHistoryItemWrapper(item, this.decisionHistory));

      this.isRoleAssignment = ['ESet', 'QERAssign'].includes(this.request.TableName.value);
      if (!this.isRoleAssignment) {
        this.serviceItem = await this.itshopService.getServiceItem(this.request.UID_AccProduct.value,
          // if the service item is not in the catalog, just use null
          true);
      }
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    this.logger.debug(this, 'approverContainer has been initialized');
    /**
     * Resolve an issue where the mat-tab navigation arrows could appear on first load
     */
    setTimeout(() => {
      TabControlHelper.triggerResizeEvent();
    });
  }

  private isForView(cdr: ColumnDependentReference): boolean {
    return cdr.column.ColumnName !== 'PWOPriority' || cdr.column.GetValue() !== 0;
  }
}
