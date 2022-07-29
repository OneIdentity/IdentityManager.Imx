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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Input, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { EuiLoadingService } from '@elemental-ui/core';

import { clearStylesFromDOM, ExtService } from 'qbm';
import { ProjectConfig, QerProjectConfig } from 'imx-api-qer';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { RequestInfoComponent } from './request-info.component';
import { ItshopService } from '../../itshop/itshop.service';
import { RequestParameterDataEntity } from './request-parameter-data-entity.interface';

@Component({
  selector: 'imx-decision-history',
  template: '<p>MockDecisionInfo</p>'
})
class MockDecisionInfo {
  @Input() public pwoDecisionHistory: any;
}

describe('RequestInfoComponent', () => {

  let projectConfig: ProjectConfig & QerProjectConfig

  const extServiceStub = {
    Registry: jasmine.createSpy('Registry')
  };

  const projectConfigurationServiceStub = {
    getConfig: jasmine.createSpy('getConfig').and.callFake(() => Promise.resolve(projectConfig))
  }

  const itshopServiceStub = {
    getApprovers: jasmine.createSpy('getApprovers').and.callFake(() => Promise.resolve({
      totalCount: 1, Data: [
        { UID_Person: { value: 'uidOfAPerson' } }
      ]
    })),
    createTypedHistory: __ => [],
    getServiceItem: jasmine.createSpy('getServiceItem')
  };

  let component: RequestInfoComponent;
  let fixture: ComponentFixture<RequestInfoComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        RequestInfoComponent,
        MockDecisionInfo,
      ],
      imports: [
        LoggerTestingModule,
        MatCardModule
      ],
      providers: [
        {
          provide: ExtService,
          useValue: extServiceStub
        },
        {
          provide: ProjectConfigurationService,
          useValue: projectConfigurationServiceStub
        },
        {
          provide: ItshopService,
          useValue: itshopServiceStub
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestInfoComponent);
    component = fixture.componentInstance;
    projectConfigurationServiceStub.getConfig.calls.reset();
    itshopServiceStub.getServiceItem.calls.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  for (const testcase of [
    { uiOrderState: '', expect: false },
    { uiOrderState: 'OrderProduct', expect: true },
    { uiOrderState: 'OrderUnsubscribe', expect: true },
    { uiOrderState: 'OrderProlongate', expect: true }
  ]) {
    it('can be initialized', async () => {
      projectConfig = {
        ITShopConfig: {
          VI_ITShop_NextApproverCanBeSeen: false,
          VI_ITShop_CurrentApproversCanBeSeen: false
        }
      } as ProjectConfig & QerProjectConfig;
      component.request = {
        GetEntity: () => ({
          GetKeys: () => ['entity']
        }),
        DecisionLevel: { },
        UiOrderState: { value: testcase.uiOrderState },
        UID_QERWorkingMethod: { },
        parameterColumns: [],
        UID_AccProduct: {},
        TableName: {}
      } as RequestParameterDataEntity;
      await component.ngOnInit();
      expect(component.approverContainer.config).toBeDefined();
      expect(component.approverContainer.isInWorkflow).toEqual(testcase.expect);
    });
  }

  it('can render role membership details', async () => {
    projectConfig = {
      ITShopConfig: {
        VI_ITShop_NextApproverCanBeSeen: false,
        VI_ITShop_CurrentApproversCanBeSeen: false
      }
    } as ProjectConfig & QerProjectConfig;
    component.request = {
      GetEntity: () => ({
        GetKeys: () => ['entity']
      }),
      DecisionLevel: { },
      UiOrderState: { },
      UID_QERWorkingMethod: { },
      parameterColumns: [],
      UID_AccProduct: {},
      TableName: { value: 'QERAssign'}
    } as RequestParameterDataEntity;
    await component.ngOnInit();
    expect(component.isRoleAssignment).toBeTruthy();
    expect(itshopServiceStub.getServiceItem).not.toHaveBeenCalled();
  });

  it('can render service item details', async () => {
    projectConfig = {
      ITShopConfig: {
        VI_ITShop_NextApproverCanBeSeen: false,
        VI_ITShop_CurrentApproversCanBeSeen: false
      }
    } as ProjectConfig & QerProjectConfig;
    component.request = {
      GetEntity: () => ({
        GetKeys: () => ['entity']
      }),
      DecisionLevel: { },
      UiOrderState: { },
      UID_QERWorkingMethod: { },
      parameterColumns: [],
      UID_AccProduct: {},
      TableName: { value: ''}
    } as RequestParameterDataEntity;
    await component.ngOnInit();
    expect(itshopServiceStub.getServiceItem).toHaveBeenCalledTimes(1);
    expect(component.isRoleAssignment).toBeFalsy();
  })
});
