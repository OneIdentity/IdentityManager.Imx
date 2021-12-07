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

import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';

import { BaseCdr, BaseReadonlyCdr, BulkItem, BulkItemStatus } from 'qbm';
import { WorkflowActionEdit } from './workflow-action-edit.interface';

@Component({
  selector: 'imx-workflow-action',
  templateUrl: './workflow-action.component.html',
  styleUrls: ['./workflow-action.component.scss']
})
export class WorkflowActionComponent {
  public readonly formGroup = new FormGroup({});
  public readonly requests: BulkItem[];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: WorkflowActionEdit,
    public readonly sideSheetRef: EuiSidesheetRef
  ) {
    this.requests = this.data.requests.map(item => {
      const bulkItem: BulkItem = {
        entity: item,
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

    if (this.data.customValidation) {
      this.formGroup.setValidators(_ => this.data.customValidation.validate() ? null : ({ required: true }));
    }
  }

  public validateItem(bulkItem: BulkItem): void {
    bulkItem.status = bulkItem.valid ? BulkItemStatus.valid : BulkItemStatus.unknown;
  }
}
