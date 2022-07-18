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
import { ReactiveFormsModule } from '@angular/forms';
import { EuiMaterialModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { PortalServiceitems } from 'imx-api-qer';
import { IEntity, IEntityColumn } from 'imx-qbm-dbts';

import { ClassloggerService } from 'qbm';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { ServiceItemTagsService } from '../../service-item-tags/service-item-tags.service';
import { UserModelService } from '../../user/user-model.service';
import { ServiceItemsEditService } from '../service-items-edit.service';
import { ServiceItemsEditFormComponent } from './service-items-edit-form.component';

export class ServiceItemsEditFormCommonTestData {

  public static mockEntityColumn = {
    ColumnName: '',
    GetMetadata: () => {
      return {
        CanEdit: () => false,
        GetDisplay: () => '',
        GetMinLength: () => 0
      };
    },
    GetDisplayValue: () => '',
    GetValue: () => '',
    PutValue: _ => { },

  } as IEntityColumn;

  public static mockEntity = {
    GetDisplay: () => 'Display value',
    GetKeys: () => ['1'],
    GetColumn: (name) => ServiceItemsEditFormCommonTestData.mockEntityColumn
  } as IEntity;

}

describe('ServiceItemsEditFormComponent', () => {
  let component: ServiceItemsEditFormComponent;
  let fixture: ComponentFixture<ServiceItemsEditFormComponent>;

  let mockProjectConfigurationService = {
    getConfig: () => {
      return Promise.resolve({
        OwnershipConfig: {
          EditableFields: {
            AccProduct: []
          }
        }
      });
    },
  };

  const serviceItem = {
    GetEntity: () => ServiceItemsEditFormCommonTestData.mockEntity,
    Description: { Column: ServiceItemsEditFormCommonTestData.mockEntityColumn },
    UID_AccProductGroup: { Column: ServiceItemsEditFormCommonTestData.mockEntityColumn },
    UID_PWODecisionMethod: { Column: ServiceItemsEditFormCommonTestData.mockEntityColumn },
    UID_AccProductParamCategory: { Column: ServiceItemsEditFormCommonTestData.mockEntityColumn, value: '' },
    UID_OrgAttestator: { Column: ServiceItemsEditFormCommonTestData.mockEntityColumn },
    UID_OrgRuler: { Column: ServiceItemsEditFormCommonTestData.mockEntityColumn },
    IsInActive: {
      Column: ServiceItemsEditFormCommonTestData.mockEntityColumn,
      GetMetadata: () => { return { CanEdit: () => true, GetDisplay: () => '' } }
    },
  } as any as PortalServiceitems;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ServiceItemsEditFormComponent
      ],
      imports: [
        ReactiveFormsModule,
        EuiMaterialModule
      ],
      providers: [
        {
          provide: ServiceItemsEditService,
          useValue: {
            hasAccproductparamcategoryCandidates: jasmine.createSpy('hasAccproductparamcategoryCandidates').and.returnValue(true),
            handleOpenLoader: jasmine.createSpy('handleOpenLoader').and.callThrough(),
            handleCloseLoader: jasmine.createSpy('handleCloseLoader').and.callThrough(),
          }
        },
        {
          provide: ProjectConfigurationService,
          useValue: mockProjectConfigurationService
        },
        {
          provide: UserModelService,
          useValue: {
            getUserConfig: jasmine.createSpy('getUserConfig').and.returnValue(Promise.resolve(
              {}
            ))
          }
        },
        {
          provide: ServiceItemTagsService,
          useValue: {
            getTags: jasmine.createSpy('getTags').and.returnValue(Promise.resolve({ TotalCount: 0, Data: [] })),
            updateTags: jasmine.createSpy('updateTags')
          }
        },
        {
          provide: ClassloggerService,
          useValue: {
            trace: jasmine.createSpy('trace').and.callThrough()
          }
        },
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceItemsEditFormComponent);
    component = fixture.componentInstance;    
    component.serviceItem = serviceItem;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onRequestableCheckChanged() tests', () => {
    it(`should set the value of the 'IsInActive' property as 'false' when the checkbox is checked`, () => {
      const mockToggleChange: any = { checked: true };
      component.onRequestableToggleChanged(mockToggleChange);
      expect(component.serviceItem.IsInActive.value).toEqual(false);
    });
    it(`should set the value of the 'IsInActive' property as 'true' when the checkbox is not checked`, () => {
      const mockToggleChange: any = { checked: false };
      component.serviceItem.IsInActive.value = false;
      component.onRequestableToggleChanged(mockToggleChange);
      expect(component.serviceItem.IsInActive.value).toEqual(true);
    });
  });
});
