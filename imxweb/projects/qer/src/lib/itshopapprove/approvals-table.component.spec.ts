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

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { of, Subject } from 'rxjs';

import { IEntity, IEntityColumn } from 'imx-qbm-dbts';

import { AuthenticationService, clearStylesFromDOM, ExtService } from 'qbm';
import { ApprovalsTableComponent } from './approvals-table.component';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { ApprovalsService } from './approvals.service';
import { Approval } from './approval';
import { WorkflowActionService } from './workflow-action/workflow-action.service';
import { PortalItshopApproveRequests } from 'imx-api-qer';
import { UserModelService } from '../user/user-model.service';

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public entitySchema: any;
  @Input() public settings: any;
  @Input() public hiddenElements: any;
}

@Component({
  selector: 'imx-data-table',
  template: '<p>MockDataTableComponent</p>'
})
export class MockDataTableComponent {
  @Input() public dst: any;
  @Input() detailViewVisible: any;
  @Input() selectable: any;
}

@Component({
  selector: 'imx-data-table-column',
  template: '<p>MockDataTableColumnComponent</p>'
})
class MockDataTableColumnComponent {
  @Input() public entityColumn: any;
  @Input() public entitySchema: any;
  @Input() public columnLabel: any;
}

@Component({
  selector: 'imx-data-table-generic-column',
  template: '<p>MockDataTableGenericColumnComponent</p>'
})
class MockDataTableGenericColumnComponent {
  @Input() public columnName: any;
  @Input() public columnLabel: any;
}

@Component({
  selector: 'imx-data-source-paginator',
  template: '<p>MockDataSourcePaginatorComponent</p>',
})
export class MockDataSourcePaginatorComponent {
  @Input() public dst: any;
}

@Component({
  selector: 'eui-icon',
  template: '<p>MockEuiIcon</p>',
})
export class MockEuiIcon {
  @Input() public icon: any;
}

describe('ApprovalsTable', () => {
  let component: ApprovalsTableComponent;
  let fixture: ComponentFixture<ApprovalsTableComponent>;

  function createColumn(value?: any, canEdit = true): IEntityColumn {
    return {
      GetMetadata: () => ({ CanEdit: () => canEdit }),
      GetValue: () => value
    } as IEntityColumn;
  }

  function createEntity(columns: { [name: string]: IEntityColumn } = {}, key?: string): IEntity {
    return {
      GetDisplay: () => '',
      GetColumn: name => columns[name] || createColumn(),
      GetKeys: () => [key]
    } as unknown as IEntity;
  }

  const projectConfigurationServiceStub = {
    getConfig: jasmine.createSpy('getConfig').and.returnValue(Promise.resolve({
      ITShopConfig: {}
    }))
  };

  let getDataSpy: jasmine.Spy;

  const extServiceStub = {
    Registry: jasmine.createSpy('Registry')
  };

  const approvalServiceTestHelper = new class {
    actionResult = false;

    readonly approvalsServiceStub = {
      PortalItshopApproveRequestsSchema: PortalItshopApproveRequests.GetEntitySchema(),
      get: jasmine.createSpy('get').and.returnValue(Promise.resolve({})),
      directDecisions: jasmine.createSpy('directDecisions').and.callFake(() => Promise.resolve(this.actionResult)),
      addAdditionalApprovers: jasmine.createSpy('addAdditionalApprovers').and.callFake(() => Promise.resolve(this.actionResult)),
      delegateDecisions: jasmine.createSpy('delegateDecisions').and.callFake(() => Promise.resolve(this.actionResult)),
      denyDecisions: jasmine.createSpy('denyDecisions').and.callFake(() => Promise.resolve(this.actionResult)),
      escalateDecisions: jasmine.createSpy('escalateDecisions').and.callFake(() => Promise.resolve(this.actionResult)),
      revokeDelegations: jasmine.createSpy('revokeDelegations').and.callFake(() => Promise.resolve(this.actionResult)),
      approve: jasmine.createSpy('approve').and.callFake(() => Promise.resolve(this.actionResult)),
      deny: jasmine.createSpy('deny').and.callFake(() => Promise.resolve(this.actionResult)),
      getApprovalDataModel: jasmine.createSpy('getApprovalDataModel').and.returnValue(Promise.resolve({}))
    };
  }();

  const sideSheetTestHelper = new class {
    afterClosedResult = false;
    readonly servicestub = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of(this.afterClosedResult)
      })
    };

    reset() {
      this.afterClosedResult = false;
    }
  }();

  const mockAuthService = {
    onSessionResponse: of({UserUid: 'userIdWithMail'})
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ApprovalsTableComponent,
        MockDataTableColumnComponent,
        MockDataTableComponent,
        MockDataSourceToolbarComponent,
        MockDataTableGenericColumnComponent,
        MockDataSourcePaginatorComponent,
        MockEuiIcon
      ],
      imports: [
        LoggerTestingModule,
        MatMenuModule
      ],
      providers: [
        {
          provide: ExtService,
          useValue: extServiceStub
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: ProjectConfigurationService,
          useValue: projectConfigurationServiceStub
        },
        {
          provide: EuiSidesheetService,
          useValue: sideSheetTestHelper.servicestub
        },
        {
          provide: ApprovalsService,
          useValue: approvalServiceTestHelper.approvalsServiceStub
        },
        {
          provide: WorkflowActionService,
          useValue: {
            applied: new Subject()
          }
        },
        {
          provide: UserModelService,
          useValue: {
            getGroups: () => Promise.resolve([])
          }
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService
        }
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalsTableComponent);
    component = fixture.componentInstance;
    projectConfigurationServiceStub.getConfig.calls.reset();
    approvalServiceTestHelper.approvalsServiceStub.get.calls.reset();
    sideSheetTestHelper.reset();
    getDataSpy = spyOn(component, 'getData').and.callThrough();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should have an selected item there only rerouting is allowed', () => {
    const approval = new class {
      canWithdrawAdditionalApprover = __ => false;
      canAddApprover = __ => false;
      canDenyApproval = __ => false;
      canDelegateDecision = __ => false;
      canRerouteDecision = __ => true;
    }() as Approval;

    component.selectedItems = [approval];

    expect(component.canWithdrawAdditionalApprover).toBeFalsy();
    expect(component.canAddApprover).toBeFalsy();
    expect(component.canDelegateDecision).toBeFalsy();
    expect(component.canDenyApproval).toBeFalsy();
    expect(component.canRerouteDecision).toBeTruthy();
    expect(component.canPerformActions).toBeTruthy();
  });

  it('edit an pwo', () => {
    const approval = new class {
      GetEntity = () => createEntity({ DocumentNumber: createColumn('123') });
    }() as Approval;

    component.editPwo(approval);

    if (sideSheetTestHelper.afterClosedResult) {
      expect(getDataSpy).toHaveBeenCalled();
    } else {
      expect(getDataSpy).not.toHaveBeenCalled()
    }

  });

  it('update items on selection changed', () => {
    const approval = new class {
      DocumentNumber = { value: '123' };
    }() as Approval;

    expect(component.selectedItems.length).toBe(0);

    component.onSelectionChanged([approval]);

    expect(component.selectedItems.length).toBe(1);
    expect(component.selectedItems[0].DocumentNumber.value).toBe('123');
  });

});
