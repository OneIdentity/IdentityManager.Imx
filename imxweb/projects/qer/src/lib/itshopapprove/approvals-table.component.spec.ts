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

import { EuiSidesheetService } from '@elemental-ui/core';
import { of, Subject } from 'rxjs';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';

import { IEntity, IEntityColumn } from 'imx-qbm-dbts';

import { clearStylesFromDOM, ExtService } from 'qbm';
import { ApprovalsTableComponent } from './approvals-table.component';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { ApprovalsService } from './approvals.service';
import { Approval } from './approval';
import { WorkflowActionService } from './workflow-action/workflow-action.service';
import { UserModelService } from '../user/user-model.service';
import { ApprovalsModule } from './approvals.module';

describe('ApprovalsTable', () => {
  let component: ApprovalsTableComponent;
  let fixture: MockedComponentFixture<ApprovalsTableComponent>;

  function createColumn(value?: any, canEdit = true): IEntityColumn {
    return {
      GetMetadata: () => ({ CanEdit: () => canEdit }),
      GetValue: () => value,
    } as IEntityColumn;
  }

  function createEntity(columns: { [name: string]: IEntityColumn } = {}, key?: string): IEntity {
    return {
      GetDisplay: () => '',
      GetColumn: (name) => columns[name] || createColumn(),
      GetKeys: () => [key],
    } as unknown as IEntity;
  }

  const projectConfigurationServiceStub = {
    getConfig: jasmine.createSpy('getConfig').and.returnValue(
      Promise.resolve({
        ITShopConfig: {},
      })
    ),
  };

  let getDataSpy: jasmine.Spy;

  const extServiceStub = {
    Registry: jasmine.createSpy('Registry'),
  };
  const sideSheetTestHelper = new (class {
    afterClosedResult = false;
    readonly servicestub = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of(this.afterClosedResult),
      }),
    };

    reset() {
      this.afterClosedResult = false;
    }
  })();

  beforeEach(() => {
    return MockBuilder(ApprovalsTableComponent)
      .mock(ApprovalsModule)
      .mock(ExtService, extServiceStub as unknown)
      .mock(EuiSidesheetService, sideSheetTestHelper.servicestub)
      .mock(UserModelService,{ getFeatures: () => Promise.resolve({}) })
      .mock(WorkflowActionService, { applied: new Subject() })
      .mock(ProjectConfigurationService, projectConfigurationServiceStub)
      .mock(ApprovalsService);
  });

  beforeEach(() => {
    fixture = MockRender(ApprovalsTableComponent);
    component = fixture.point.componentInstance;
    projectConfigurationServiceStub.getConfig.calls.reset();
    sideSheetTestHelper.reset();

    getDataSpy = spyOn(component, 'getData').and.callThrough();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should have an selected item there only rerouting is allowed', () => {
    const approval = new (class {
      canWithdrawAdditionalApprover = (__) => false;
      canAddApprover = (__) => false;
      canDenyApproval = (__) => false;
      canDelegateDecision = (__) => false;
      canRerouteDecision = (__) => true;
    })() as Approval;

    component.selectedItems = [approval];

    expect(component.canWithdrawAdditionalApprover).toBeFalsy();
    expect(component.canAddApprover).toBeFalsy();
    expect(component.canDelegateDecision).toBeFalsy();
    expect(component.canDenyApproval).toBeFalsy();
    expect(component.canRerouteDecision).toBeTruthy();
    expect(component.canPerformActions).toBeTruthy();
  });

  it('edit an pwo', () => {
    const approval = new (class {
      GetEntity = () => createEntity({ DocumentNumber: createColumn('123') });
    })() as Approval;

    component.editPwo(approval);

    if (sideSheetTestHelper.afterClosedResult) {
      expect(getDataSpy).toHaveBeenCalled();
    } else {
      expect(getDataSpy).not.toHaveBeenCalled();
    }
  });

  it('update items on selection changed', () => {
    const approval = new (class {
      DocumentNumber = { value: '123' };
    })() as Approval;

    expect(component.selectedItems.length).toBe(0);

    component.onSelectionChanged([approval]);

    expect(component.selectedItems.length).toBe(1);
    expect(component.selectedItems[0].DocumentNumber.value).toBe('123');
  });
});
