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

import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseCdr, BaseReadonlyCdr, BulkItem, BulkItemStatus } from 'qbm';
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
  styleUrls: ['./workflow-multi-action.component.scss']
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
  @Input() public formGroup: FormGroup;

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
   * @ignore since this is only an internal component
   *
   * Sets up during OnInit lifecycle hook the bulk items and their {@link columns} to be displayed/edited for the requests.
   */
  public ngOnInit(): void {
    this.requests = this.data.requests.map(item => {
      const bulkItem: BulkItem = {
        entity: item,
        additionalInfo: item.OrderState.Column.GetDisplayValue(),
        properties: [],
        status: BulkItemStatus.valid
      };

      if (this.data.showValidDate) {
        if (this.data.showValidDate.validFrom) {
          bulkItem.properties.push(new BaseReadonlyCdr(item.ValidFrom.Column));
        }
        if (this.data.showValidDate.validUntil) {
          bulkItem.properties.push(new BaseReadonlyCdr(item.ValidUntil.Column));
        }
      }

      item.parameterColumns.forEach(column =>
        bulkItem.properties.push(this.data.approve ? new BaseCdr(column) : new BaseReadonlyCdr(column))
      );

      if (this.data.workflow) {
        bulkItem.customSelectProperties = [{
          title: this.data.workflow.title,
          placeholder: this.data.workflow.placeholder,
          entities: this.data.workflow.data[item.key],
          selectionChange: entity => {
            if (item.updateDirectDecisionTarget) {
              item.updateDirectDecisionTarget(entity);
            }
          }
        }];
      }

      return bulkItem;
    });
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

}
