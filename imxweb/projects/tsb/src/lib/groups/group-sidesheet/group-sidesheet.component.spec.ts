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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { GroupSidesheetComponent } from './group-sidesheet.component';
import { PortalTargetsystemUnsGroupServiceitem } from 'imx-api-tsb';
import { CdrModule, ElementalUiConfigService, EntityColumnStub, ExtService, SystemInfoService } from 'qbm';
import { GroupsService } from '../groups.service';
import { DeHelperService } from '../../de-helper.service';
import { TsbTestBed } from '../../test/tsb-test-bed.spec';
import { TsbCommonTestData } from '../../test/common-test-mocks.spec';
import { GroupsReportsService } from '../groups-reports.service';
import { ProjectConfigurationService, ServiceCategoriesService } from 'qer';
import { IEntity, IEntityColumn, IValueMetadata } from 'imx-qbm-dbts';
import { Subject } from 'rxjs';

@Component({
  selector: 'imx-object-attestation',
  template: '<p>MockObjectAttestationComponent</p>'
})
class MockObjectAttestationComponent {
  @Input() parameters: any;
}

@Component({
  selector: 'imx-service-items-edit-form',
  template: ''
})
export class ServiceItemEditFormStubComponent {
  saveTags() { }
}

describe('GroupSidesheetComponent', () => {
  let component: GroupSidesheetComponent;
  let fixture: ComponentFixture<GroupSidesheetComponent>;

  let saveChangesSpy: jasmine.Spy;

  const configService = {
    getConfig: jasmine.createSpy('getConfig').and.returnValue(Promise.resolve({
      OwnershipConfig: {
        EditableFields: {
          AccProduct: [],
          testTable: []
        }
      }
    }))
  }

  const testHelper = new class {
    entityColumnStub: IEntityColumn;
    entityColumnValue: any;
    entityDisplay = 'Display value';
    metaDataDisplay = '';
    metaDataCanEdit = true;
    readonly keys = ['1'];

    createEntityColumnStub() {
      this.entityColumnStub = new EntityColumnStub(this.entityColumnValue, 'false', this.metaData);
    }

    metaData = {
      CanEdit: () => this.metaDataCanEdit,
      GetDisplay: () => this.metaDataDisplay,
      GetMinLength: () => 0
    } as IValueMetadata;

    entityStub = {
      GetDisplay: () => this.entityDisplay,
      GetKeys: () => this.keys,
      GetColumn: (name) => this.entityColumnStub
    } as IEntity;
  }

  const group = {
    GetEntity: () => testHelper.entityStub,
    getColumns: __ => []
  };

  const serviceItem = {
    GetEntity: () => TsbCommonTestData.mockEntity,
    Description: { Column: TsbCommonTestData.mockEntityColumn },
    UID_AccProductGroup: { Column: TsbCommonTestData.mockEntityColumn },
    UID_PWODecisionMethod: { Column: TsbCommonTestData.mockEntityColumn },
    UID_AccProductParamCategory: { Column: TsbCommonTestData.mockEntityColumn, value: '' },
    UID_OrgAttestator: { Column: TsbCommonTestData.mockEntityColumn },
    UID_OrgRuler: { Column: TsbCommonTestData.mockEntityColumn },
    IsInActive: {
      Column: TsbCommonTestData.mockEntityColumn,
      GetMetadata: () => { return { CanEdit: () => true, GetDisplay: () => '' } }
    },
  } as PortalTargetsystemUnsGroupServiceitem;

  const serviceCategoriesServiceStub = {
    hasAccproductparamcategoryCandidates:
      jasmine.createSpy('hasAccproductparamcategoryCandidates').and.returnValue(Promise.resolve(true)),
  };

  let projectConfig = {
    OwnershipConfig: {}
  };

  const projectConfigurationServiceStub = {
    getConfig: jasmine.createSpy('getConfig').and.callFake(() => Promise.resolve(projectConfig))
  }

  TsbTestBed.configureTestingModule({
    declarations: [
      GroupSidesheetComponent,
      ServiceItemEditFormStubComponent,
      MockObjectAttestationComponent
    ],
    imports: [FormsModule, ReactiveFormsModule, CdrModule, NoopAnimationsModule, EuiCoreModule],
    providers: [
      {
        provide: GroupsService,
        useValue: {
          createGroupOwnerPersonCdr: jasmine.createSpy('createGroupOwnerPersonCdr').and.returnValue(Promise.resolve({})),
          getGroupServiceItem: jasmine.createSpy('getGroupServiceItem').and.returnValue(Promise.resolve({})),
        },
      },
      DeHelperService,
      {
        provide: EUI_SIDESHEET_DATA,
        useValue: { group, groupServiceItem: serviceItem, unsGroupDbObjectKey: { Keys: testHelper.keys, TableName: 'testTable' } }
      },
      GroupsReportsService,
      {
        provide: EuiLoadingService,
        useValue: {
          hide: jasmine.createSpy('hide'),
          show: jasmine.createSpy('show')
        }
      },
      {
        provide: EuiSidesheetRef,
        useValue: {
          closeClicked: () => new Subject(),
          close: __ => { }
        }
      },
      {
        provide: ServiceCategoriesService,
        useValue: serviceCategoriesServiceStub
      },
      {
        provide: ProjectConfigurationService,
        useValue: projectConfigurationServiceStub
      },
      {
        provide: SystemInfoService,
        useValue: {
          get: jasmine.createSpy('get').and.callFake(() => Promise.resolve({
            // for testing purposes, assume that RISKINDEX is active
            PreProps: ['RISKINDEX']
          }))
        }
      },
      {
        provide: ElementalUiConfigService,
        useValue: {
          Config: jasmine.createSpy('Config').and.returnValue({ downloadOptions: {} })
        }
      },
      {
        provide: ProjectConfigurationService,
        useValue: configService
      },
      ExtService,
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    saveChangesSpy = spyOn<any>(component, 'saveChanges');
    saveChangesSpy.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cancel() tests', () => {
    it('should make a call to close the sidesheet', () => {
      const sidesheetCloseSpy = spyOn<any>(component['sidesheet'], 'close');
      component.cancel();
      expect(sidesheetCloseSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET selectedGroup() tests', () => {
    it('should return the `groupId` property', () => {
      expect(component.groupId).toEqual(group.GetEntity().GetKeys().join(''));
    });
  });

  describe('saveGroup() tests', () => {
    it('should call saveChanges with the correct parameters', async () => {
      const expectedMsg = '#LDS#The system entitlement has been successfully saved.';
      await component.saveGroup();
      expect(saveChangesSpy).toHaveBeenCalledWith(component.detailsFormGroup, group, expectedMsg);
    });
  });

  describe('saveGroupServiceItem() tests', () => {
    it('should call save with the short confirmation message when a role is set as group owner', async () => {
      const expectedConfirmMsg = '#LDS#The service item has been successfully saved.';
      await component.saveGroupServiceItem();
      expect(saveChangesSpy).toHaveBeenCalledWith(component.serviceItemFormGroup, component.groupServiceItem, expectedConfirmMsg);
    });
  });

  describe('onDeleteGroupMembers() tests', () => {
    it('should make a call to the groupMembersComponent deleteMembers() method', async () => {
      const mockGroupMembersComponent: any = {
        deleteMembers: jasmine.createSpy('deleteMembers'),
        unsubscribeMembership: jasmine.createSpy('unsubscribeMembership')
      };
      component.groupMembersComponent = mockGroupMembersComponent;
      await component.onDeleteGroupMembers('unsubscribe');
      expect(mockGroupMembersComponent.unsubscribeMembership).toHaveBeenCalled();
    });
  });
});
