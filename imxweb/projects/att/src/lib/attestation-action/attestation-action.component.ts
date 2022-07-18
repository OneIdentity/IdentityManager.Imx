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

import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { DisplayColumns, IEntity } from 'imx-qbm-dbts';
import { BaseCdr, BaseReadonlyCdr, BulkItem, BulkItemStatus, ColumnDependentReference, DataSourceToolbarSettings } from 'qbm';
import { AttestationCaseAction } from './attestation-case-action.interface';

@Component({
  selector: 'imx-attestation-action',
  templateUrl: './attestation-action.component.html',
  styleUrls: ['./attestation-action.component.scss']
})
export class AttestationActionComponent {
  public readonly formGroup = new FormGroup({});
  public readonly actionParameters: ColumnDependentReference[] = [];
  public readonly dstSettings: DataSourceToolbarSettings;
  public readonly displayColumns = DisplayColumns;
  public readonly attestationCases: BulkItem[];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: {
      description?: string;
      attestationCases: AttestationCaseAction[]
      actionParameters: {
        reason: ColumnDependentReference,
        justification: ColumnDependentReference
        person: ColumnDependentReference
      },
      workflow?: {
        title: string,
        placeholder: string,
        data: { [key: string]: IEntity[] }
      },
      approve?: boolean
    },
    public readonly sideSheetRef: EuiSidesheetRef
  ) {
    Object.keys(this.data.actionParameters).forEach(name =>
      this.actionParameters.push(this.data.actionParameters[name])
    );

    this.attestationCases = this.data.attestationCases.map(item => {
      const bulkItem: BulkItem = {
        entity: item.typedEntity,
        properties: item.propertiesForAction
          .filter(property => property.GetValue() != null && property.GetValue() !== '')
          .map(property => new BaseReadonlyCdr(property)),
        status: BulkItemStatus.valid
      };

      this.parseUITextHelper(item, bulkItem);

      item.attestationParameters.forEach(column =>
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

  public validateItem(bulkItem: BulkItem): void {
    bulkItem.status = bulkItem.valid ? BulkItemStatus.valid : BulkItemStatus.unknown;
  }

  private parseUITextHelper(attestationCase: AttestationCaseAction, bulkItem: BulkItem): void {
    if (!this.data.approve || attestationCase.uiData?.WorkflowActionHint == null) {
      return;
    }
    const regex = /\%.+\%/g;
    const found = attestationCase.uiData.WorkflowActionHint.match(regex);

    if (found == null) {
      bulkItem.description = attestationCase.uiData?.WorkflowActionHint;
      return;
    }

    found.forEach(item => {
      // Cannot use str.replaceAll() - not supported yet.
      const normalized = item.split('%').join('');
      if (attestationCase[normalized]) {
        bulkItem.description = attestationCase.uiData.WorkflowActionHint.replace(item, attestationCase[normalized].value);
      }

    });
  }
}
