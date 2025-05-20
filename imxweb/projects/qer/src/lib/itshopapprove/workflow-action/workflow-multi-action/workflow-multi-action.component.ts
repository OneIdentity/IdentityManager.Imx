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

import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ValType } from '@imx-modules/imx-qbm-dbts';
import { BaseCdr, BaseReadonlyCdr, BulkItem, BulkItemStatus, BusyService } from 'qbm';
import { Approval } from '../../approval';
import { ApprovalsService } from '../../approvals.service';
import { DecisionStepSevice } from '../../decision-step.service';
import { WorkflowActionEdit } from '../workflow-action-edit.interface';

/**
 * @ignore since this is only an internal component.
 *
 * Component for making a decision for a multiple requests.
 * There is an alternative component for the case of a decision for a single requests as well: {@link WorkflowSingleActionComponent}.
 */
@Component({
  selector: 'imx-workflow-multi-action',
  templateUrl: './workflow-multi-action.component.html',
  styleUrls: ['./workflow-multi-action.component.scss'],
})
export class WorkflowMultiActionComponent implements OnInit {
  /**
   * @ignore since this is only an internal component.
   *
   * Data coming from the service about the requests.
   */
  @Input() public data: WorkflowActionEdit;

  /**
   * @ignore since this is only an internal component.
   *
   * The form group to which the necessary form fields will be added.
   */
  @Input() public formGroup: UntypedFormGroup;

  /**
   * @ignore since this is only public because of databinding to the template
   *
   * The bulk items generated for the requests.
   * Each bulk item contains the columns to be displayed/edited for the request
   * according to the decision action chosen.
   *
   */
  public requests: BulkItem[];

  /**
   * @ignore only used in template
   * The service, that is used for an async loading process.
   */
  public busyService = new BusyService();

  constructor(
    private readonly stepService: DecisionStepSevice,
    private readonly approvalService: ApprovalsService,
  ) {}

  /**
   * @ignore since this is only an internal component
   *
   * Sets up during OnInit lifecycle hook the bulk items and their {@link columns} to be displayed/edited for the requests.
   */
  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.requests = await Promise.all(this.data.requests.map(async (item) => this.buildSingleItem(item as Approval)));
    } finally {
      isBusy.endBusy();
    }
  }

  /**
   * @ignore since this is only public because of databinding to the template
   *
   * Handles the validationStateChanged event emitted by an bulk item editor.
   * Recalculates the validity of the bulk item.
   *
   * @param bulkItem The bulk item that has changed state
   */
  public validateItem(bulkItem: BulkItem): void {
    bulkItem.status = bulkItem.valid ? BulkItemStatus.valid : BulkItemStatus.unknown;
  }

  private async buildSingleItem(approval: Approval): Promise<BulkItem> {
    const bulkItem: BulkItem = {
      entity: approval,
      additionalInfo: approval.OrderState.Column.GetDisplayValue(),
      properties: [],
      status: BulkItemStatus.valid,
    };

    if (this.data.showValidDate) {
      if (
        (this.data.showValidDate.validFrom && approval.ValidFrom.Column.GetValue() !== '') ||
        approval.ValidFrom.GetMetadata().CanEdit()
      ) {
        bulkItem.properties.push(new BaseCdr(approval.ValidFrom.Column));
      }
      if (
        (this.data.showValidDate.validUntil && approval.ValidUntil.Column.GetValue() !== '') ||
        approval.ValidUntil.GetMetadata().CanEdit()
      ) {
        bulkItem.properties.push(new BaseCdr(approval.ValidUntil.Column));
      }
    }

    const step = this.stepService.getCurrentStepCdr(approval, approval.pwoData, '#LDS#Current approval step');
    if (step != null) {
      bulkItem.properties.unshift(step);
    }

    const cRule = this.stepService.getAdditionalInfoCdr(approval, approval.pwoData, '#LDS#Compliance rule');
    if (cRule != null) {
      bulkItem.properties.unshift(cRule);
    }

    if (approval.parameterColumns) {
      const entityWrapper = await this.approvalService.getExtendedEntity(approval.key);
      const interactiveColumns = entityWrapper.parameterCategoryColumns.map((item) => item.column);
      interactiveColumns.forEach((pCol) => {
          pCol.ColumnChanged.subscribe(() => {
            const originalColumn = approval.parameterColumns.find((elem) => elem.ColumnName === pCol.ColumnName);
            if (originalColumn && originalColumn.GetMetadata().CanEdit()) {
              originalColumn.PutValue(pCol.GetType() === ValType.Date ? new Date(pCol.GetValue()) : pCol.GetValue());
            }
          });
        bulkItem.properties.push(this.data.approve ? new BaseCdr(pCol) : new BaseReadonlyCdr(pCol));
      });
    }

    if (this.data.workflow) {
      bulkItem.customSelectProperties = [
        {
          title: this.data.workflow.title,
          placeholder: this.data.workflow.placeholder,
          entities: this.data.workflow.data[approval.key],
          selectionChange: (entity) => {
            if (approval.updateDirectDecisionTarget) {
              approval.updateDirectDecisionTarget(entity);
            }
          },
        },
      ];
    }

    return bulkItem;
  }
}
