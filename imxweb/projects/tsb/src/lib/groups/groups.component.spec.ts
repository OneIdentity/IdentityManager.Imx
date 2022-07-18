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
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { PortalTargetsystemUnsGroup } from 'imx-api-tsb';
import { CdrModule, imx_SessionService } from 'qbm';
import { TypedEntityCollectionData, CollectionLoadParameters } from 'imx-qbm-dbts';
import { DataExplorerGroupsComponent } from './groups.component';
import { GroupsService } from './groups.service';
import { TsbTestBed } from '../test/tsb-test-bed.spec';
import { TsbCommonTestData } from '../test/common-test-mocks.spec';
import { DeHelperService } from '../de-helper.service';



function mockGetGroups(): TypedEntityCollectionData<any> {
  return { totalCount: 100, Data: ['1', '2', '3'] };
}

describe('DataExplorerGroupsComponent', () => {
  let component: DataExplorerGroupsComponent;
  let fixture: ComponentFixture<DataExplorerGroupsComponent>;

  const navigationState: CollectionLoadParameters = { StartIndex: 1, PageSize: 50 };
  const keyword = 'test1';
  const mockSelectedGroupWithSi = { UID_AccProduct: { value: 'testValue' } } as PortalTargetsystemUnsGroup;
  const groupsServiceMock = {
    getGroups: jasmine.createSpy('getGroups').and.returnValue(Promise.resolve(mockGetGroups())),
    bulkUpdateGroupServiceItems: jasmine.createSpy('bulkUpdateGroupServiceItems').and.returnValue(Promise.resolve()),
    updateMultipleOwner: jasmine.createSpy('updateMultipleOwner').and.returnValue(Promise.resolve('Message')),
    unsGroupsSchema: jasmine.createSpy('unsGroupsSchema')
  };

  TsbTestBed.configureTestingModule({
    declarations: [DataExplorerGroupsComponent],
    imports: [FormsModule, ReactiveFormsModule, CdrModule, NoopAnimationsModule],
    providers: [
      {
        provide: imx_SessionService,
        useValue: TsbCommonTestData.mockSessionService,
      },
      {
        provide: GroupsService,
        useValue: groupsServiceMock
      },
      {
        provide: DeHelperService,
        useVlaue: {
          authorityDataDeleted: new Subject<string>()
        }
      },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            url: [
              {
                path: 'admin'
              },
              {
                path: 'UNSGroup'
              },
            ],
          }
        }
      }
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataExplorerGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change navigation state', async () => {
    await component.onNavigationStateChanged(navigationState);
    expect(component.navigationState).toEqual(navigationState);
  });

  it('should search and reset start index ', async () => {
    await component.onSearch(keyword);
    expect(component.navigationState.StartIndex).toEqual(0);
  });

  it('should search for keyword ', async () => {
    await component.onSearch(keyword);
    expect(component.navigationState.search).toEqual(keyword);
  });

  describe('bulkUpdateSelected() tests', () => {
    it(`should construct the updateData from the selected items and call the
    bulk update api to update them`, async () => {
      component.selectedGroupsForUpdate = [mockSelectedGroupWithSi];
      component.requestableBulkUpdateCtrl.setValue(false, { emitEvent: false });
      const mockDataTable: any = { clearSelection: jasmine.createSpy('clearSelection') };
      const navigateSpy = spyOn<any>(component, 'navigate');
      component.dataTable = mockDataTable;
      const expectedUpdateData = {
        Keys: [[mockSelectedGroupWithSi.UID_AccProduct.value]],
        Data: [{ Name: 'IsInActive', Value: true }]
      };
      await component.bulkUpdateSelected();
      expect(groupsServiceMock.bulkUpdateGroupServiceItems).toHaveBeenCalledWith(expectedUpdateData);
      expect(navigateSpy).toHaveBeenCalledTimes(1);
      expect(component.dataTable.clearSelection).toHaveBeenCalledTimes(1);
    })
  });
});
