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

import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { BaseCdr, BaseReadonlyCdr, BulkItem, BulkItemStatus, BusyService } from 'qbm';
import { DecisionStepSevice } from '../../decision-step.service';
import { WorkflowActionEdit } from '../workflow-action-edit.interface';
import { Approval } from '../../approval';
import { ApprovalsService } from '../../approvals.service';

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

  constructor(private readonly stepService: DecisionStepSevice, private readonly approvalService: ApprovalsService) {}

  /**
   * @ignore since this is only an internal component
   *
   * Sets up during OnInit lifecycle hook the bulk items and their {@link columns} to be displayed/edited for the requests.
   */
  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.requests = await Promise.all(this.data.requests.map(async (item) => this.buildSingleItem(item)));
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

  private async buildSingleItem(item: Approval): Promise<BulkItem> {
    const bulkItem: BulkItem = {
      entity: item,
      additionalInfo: item.OrderState.Column.GetDisplayValue(),
      properties: [],
      status: BulkItemStatus.valid,
    };

    if (this.data.showValidDate) {
      if (this.data.showValidDate.validFrom) {
        bulkItem.properties.push(new BaseReadonlyCdr(item.ValidFrom.Column));
      }
      if (this.data.showValidDate.validUntil) {
        bulkItem.properties.push(new BaseReadonlyCdr(item.ValidUntil.Column));
      }
    }

    const step = this.stepService.getCurrentStepCdr(item, item.pwoData, '#LDS#Current approval step');
    if (step != null) {
      bulkItem.properties.unshift(step);
    }

    if (item.parameterColumns) {
      const entityWrapper = await this.approvalService.getExtendedEntity(item.key);
      const interactiveColumns = entityWrapper.parameterCategoryColumns.map((item) => item.column);
      interactiveColumns.forEach((pCol) => bulkItem.properties.push(this.data.approve ? new BaseCdr(pCol) : new BaseReadonlyCdr(pCol)));
    }

    if (this.data.workflow) {
      bulkItem.customSelectProperties = [
        {
          title: this.data.workflow.title,
          placeholder: this.data.workflow.placeholder,
          entities: this.data.workflow.data[item.key],
          selectionChange: (entity) => {
            if (item.updateDirectDecisionTarget) {
              item.updateDirectDecisionTarget(entity);
            }
          },
        },
      ];
    }

    return bulkItem;
  }
}
