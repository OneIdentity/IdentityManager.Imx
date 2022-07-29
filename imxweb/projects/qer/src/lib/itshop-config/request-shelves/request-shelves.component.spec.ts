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
import { PortalShopConfigStructure } from 'imx-api-qer';
import { RequestsService } from '../requests.service';
import { RequestShelvesComponent } from './request-shelves.component';
import { RequestsConfigurationTestBed } from '../test/requests-configuration-test-bed';
import { RequestsConfigurationCommonMocks } from '../test/requests-configuration-mocks';
import { HELPER_ALERT_KEY_PREFIX, StorageService } from 'qbm';
import { CREATE_SHELF_TOKEN } from './request-shelf-token';

describe('RequestShelvesComponent', () => {
  let component: RequestShelvesComponent;
  let fixture: ComponentFixture<RequestShelvesComponent>;

  let viewRequestShopSpy: jasmine.Spy;

  RequestsConfigurationTestBed.configureTestingModule({
    declarations: [ RequestShelvesComponent ],
    providers: [
      {
        provide: CREATE_SHELF_TOKEN,
        useValue: {}
      },
      {
        provide: RequestsService,
        useValue: RequestsConfigurationCommonMocks.mockRequestsService
      },
      {
        provide: StorageService,
        useValue: RequestsConfigurationCommonMocks.mockStorageService
      }
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestShelvesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    viewRequestShopSpy = spyOn<any>(component, 'viewRequestShelf');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit() tests', () => {
    it('should setup the displayedColumns', async () => {
      await component.ngOnInit();
      expect(component['displayedColumns'].length).toEqual(2);
      expect(component['displayedColumns'][0].ColumnName).toEqual('__Display');
      expect(component['displayedColumns'][1].ColumnName).toEqual('UID_OrgAttestator');
    });
  });

  it('should change navigation state', async () => {
    await component.onNavigationStateChanged(RequestsConfigurationCommonMocks.navigationState);
    expect(component.navigationState).toEqual(RequestsConfigurationCommonMocks.navigationState);
  });

  it('should search and reset start index ', async () => {
    await component.onSearch(RequestsConfigurationCommonMocks.keyword);
    expect(component.navigationState.StartIndex).toEqual(0);
  });

  it('should search for keyword ', async () => {
    await component.onSearch(RequestsConfigurationCommonMocks.keyword);
    expect(component.navigationState.search).toEqual(RequestsConfigurationCommonMocks.keyword);
  });

  describe('onRequestShelfChanged() tests', () => {
    it('should call `viewRequestShelf` with the selected request shelf', () => {
      const mockRequestShelf = {
        GetEntity: () => RequestsConfigurationCommonMocks.mockEntity,
        ITShopInfo: { value: 'BO' },
        UID_ParentITShopOrg: { value: 'parentTestId' }
      } as PortalShopConfigStructure;
      component.onRequestShelfChanged(mockRequestShelf);
      expect(viewRequestShopSpy).toHaveBeenCalledWith(mockRequestShelf);
    });
  });

  describe('createRequestConfigShelf() tests', () => {
    it(`should call 'viewRequestShelf' with an initialised requestShop structure that details
    the parent request shop and indicate it is new`, () => {
      RequestsConfigurationCommonMocks.mockRequestsService.createRequestConfigEntity
      .and.returnValue(RequestsConfigurationCommonMocks.mockRequestShopShelfStructure);
      component.requestConfigId = 'parentId';
      RequestsConfigurationCommonMocks.mockRequestShopShelfStructure.ITShopInfo.value = 'BO';
      RequestsConfigurationCommonMocks.mockRequestShopShelfStructure.UID_ParentITShopOrg.value = 'parentId';
      component.createRequestConfigShelf();
      expect(viewRequestShopSpy).toHaveBeenCalledWith(RequestsConfigurationCommonMocks.mockRequestShopShelfStructure, true);
    });
  });

  describe('onHelperDismissed() tests', () => {
    it('should make a call to store the dismissal of the helper alert for requestShopDetails', () => {
      RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal.calls.reset();
      component.onHelperDismissed();
      const expectedHelperKey = `${HELPER_ALERT_KEY_PREFIX}_requestShopShelves`;
      expect(RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal).toHaveBeenCalledWith(expectedHelperKey);
    });
  });
});
