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

import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EuiSidesheetRef } from '@elemental-ui/core';
import { DataState } from 'imx-qbm-dbts';
import { CdrFactoryService, ColumnDependentReference, ConfirmationService } from 'qbm';
import { ApprovalWorkflowDataService } from './approval-workflow-data.service';
import { CDRGroups, ColumnConstraints, RequestLevelData, RequestStepData, RequestWorkflowData } from './approval-workflow.interface';

export enum ApprovalSidesheetResponse {
  save,
}

@Injectable({
  providedIn: 'root',
})
export class FormDataService {
  private initialState: {
    [key: string]: any;
  };

  constructor(
    private approvalWorkflowDataService: ApprovalWorkflowDataService,
    private readonly confirmation: ConfirmationService,
    private cdrService: CdrFactoryService,
  ) {}

  public async saveChanges(formGroup: FormGroup, sidesheetRef: EuiSidesheetRef): Promise<void> {
    if (formGroup.valid) {
      this.approvalWorkflowDataService.handleOpenLoader();
      try {
        // Save data and mark form as pristine for future edits
        formGroup.markAsPristine();
        sidesheetRef.close('save');
      } finally {
        this.approvalWorkflowDataService.handleCloseLoader();
      }
    }
  }

  public async cancelChanges(
    formGroup: FormGroup,
    sidesheetRef: EuiSidesheetRef,
    requestData: RequestLevelData | RequestWorkflowData
  ): Promise<void> {
    if (formGroup.pristine) {
      // No need to change any entities
      sidesheetRef.close();
    } else if (await this.confirmation.confirmLeaveWithUnsavedChanges()) {
      // Need to reload a new entity to work with
      this.resetState(requestData);
      sidesheetRef.close();
    }
  }

  public async cancelChangesGrouped(
    formGroup: FormGroup,
    sidesheetRef: EuiSidesheetRef,
    requestData: RequestStepData
    ): Promise<void> {
      if (formGroup.pristine) {
        // No need to change any entities
        sidesheetRef.close();
      } else if (await this.confirmation.confirmLeaveWithUnsavedChanges()) {
        // Need to reload a new entity to work with
        this.resetStateGrouped(requestData);
        sidesheetRef.close();
      }
    }

  public getInitialState(requestData: RequestLevelData | RequestWorkflowData): void {
    this.initialState = {};
    const entity = requestData.Object.GetEntity();
    for (const column of requestData.Data) {
      this.initialState[column] = entity.GetColumn(column).GetValue();
    }
  }

  public getInitialStateGrouped(requestData: RequestStepData): void {
    this.initialState = {};
    const entity = requestData.Object.GetEntity();
    for (const tab of Object.keys(requestData.Data)) {
      for (const column of requestData.Data[tab]) {
        this.initialState[column] = entity.GetColumn(column).GetValue();
      }
    }
  }

  public async resetState(requestData: RequestLevelData | RequestWorkflowData): Promise<void> {
    for (const columnName of requestData.Data) {
      const columnData = requestData.Object.GetEntity().GetColumn(columnName);
      if (columnData.GetDataState() === DataState.Changed) {
        await columnData.PutValue(this.initialState[columnName]);
      }
    }
  }

  public async resetStateGrouped(requestData: RequestStepData): Promise<void> {
    for (const tab of Object.keys(requestData.Data)) {
      for (const columnName of requestData.Data[tab]) {
        const columnData = requestData.Object.GetEntity().GetColumn(columnName);
        if (columnData.GetDataState() === DataState.Changed) {
          await columnData.PutValue(this.initialState[columnName]);
        }
      }
    }
  }

  public setup(requestData: RequestLevelData | RequestWorkflowData, columnConstraints?: ColumnConstraints): ColumnDependentReference[] {
    this.approvalWorkflowDataService.handleOpenLoader();
    try {
      this.getInitialState(requestData);
      return this.createCdrList(requestData, columnConstraints);
    } finally {
      this.approvalWorkflowDataService.handleCloseLoader();
    }
  }

  public setupGrouped(requestData: RequestStepData, columnConstraints?: ColumnConstraints): CDRGroups {
    this.approvalWorkflowDataService.handleOpenLoader();
    try {
      this.getInitialStateGrouped(requestData);
      return this.createCdrListGrouped(requestData, columnConstraints);
    } finally {
      this.approvalWorkflowDataService.handleCloseLoader();
    }
  }

  public createCdr(
    requestData: RequestLevelData | RequestStepData,
    columnName: string,
    columnConstraints?: ColumnConstraints
  ): ColumnDependentReference {
    const entity = requestData.Object.GetEntity();
    const cdr = this.cdrService.buildCdr(entity, columnName);
    // Apply constraints
    if (columnConstraints) {
      this.applyConstraints([cdr], [columnName], columnConstraints);
    }
    return cdr
  }

  public createCdrList(
    requestData: RequestLevelData | RequestWorkflowData,
    columnConstraints?: ColumnConstraints
  ): ColumnDependentReference[] {
    const entity = requestData.Object.GetEntity();
    const cdrList = this.cdrService.buildCdrFromColumnList(entity, requestData.Data);
    // Apply constraints
    if (columnConstraints) {
      this.applyConstraints(cdrList, requestData.Data, columnConstraints);
    }
    return cdrList
  }

  public createCdrListGrouped(requestData: RequestStepData, columnConstraints?: ColumnConstraints): CDRGroups {
    const cdrGroups: CDRGroups = {};
    const entity = requestData.Object.GetEntity();
    for (const group of Object.keys(requestData.Data)) {
      const cdrList = this.cdrService.buildCdrFromColumnList(entity, requestData.Data[group]);
      if (columnConstraints) {
        this.applyConstraints(cdrList, requestData.Data[group], columnConstraints)
      }
      cdrGroups[group] = cdrList;
    }
    return cdrGroups;
  }

  public applyConstraints(cdrList: ColumnDependentReference[], columns: string[], constraints: ColumnConstraints): void {
    columns.forEach((columnName: string, index: number) => {
      if (!constraints[columnName]) {
        return;
      }
      if (constraints[columnName].minLength) {
        cdrList[index].minLength = constraints[columnName].minLength;
      }
      if (constraints[columnName].valueConstraint) {
        cdrList[index].valueConstraint = constraints[columnName].valueConstraint;
      }
    });
  }
}
