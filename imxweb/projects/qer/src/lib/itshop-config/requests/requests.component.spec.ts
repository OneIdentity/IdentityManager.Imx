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
import { RequestsService } from '../requests.service';
import { RequestsComponent } from './requests.component';
import { RequestsConfigurationTestBed } from '../test/requests-configuration-test-bed';
import { RequestsConfigurationCommonMocks } from '../test/requests-configuration-mocks';
import { HELPER_ALERT_KEY_PREFIX, StorageService } from 'qbm';

describe('RequestsComponent', () => {
  let component: RequestsComponent;
  let fixture: ComponentFixture<RequestsComponent>;

  let viewRequestShopSpy: jasmine.Spy;

  RequestsConfigurationTestBed.configureTestingModule({
    declarations: [ RequestsComponent ],
    imports: [],
    providers: [
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
    fixture = TestBed.createComponent(RequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    viewRequestShopSpy = spyOn<any>(component, 'viewRequestShop');
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

  describe('ngOnDestroy() tests', () => {
    it('should call close on the sidesheet', () => {
      const sidesheetCloseSpy = spyOn<any>(component['sidesheet'], 'close');
      component.ngOnDestroy();
      expect(sidesheetCloseSpy).toHaveBeenCalledTimes(1);
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

  describe('onRequestShopSelected() tests', () => {
    it('should call `viewRequestShop` with the selected request shop', () => {
      component.onRequestShopSelected(RequestsConfigurationCommonMocks.mockRequestShopStructure);
      expect(viewRequestShopSpy).toHaveBeenCalledWith(RequestsConfigurationCommonMocks.mockRequestShopStructure);
    });
  });

  describe('createRequestConfig() tests', () => {
    it('should call `viewRequestShop` with an initialised requestShop structure and indicate it is new', () => {
      RequestsConfigurationCommonMocks.mockRequestsService.createRequestConfigEntity
      .and.returnValue(RequestsConfigurationCommonMocks.mockRequestShopStructure);

      RequestsConfigurationCommonMocks.mockRequestShopStructure.ITShopInfo.value = 'SH';
      component.createRequestConfig();
      expect(viewRequestShopSpy).toHaveBeenCalledWith(RequestsConfigurationCommonMocks.mockRequestShopStructure, true);
    });
  });

  describe('onHelperDismissed() tests', () => {
    it('should make a call to store the dismissal of the helper alert', () => {
      RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal.calls.reset();

      expect(component.showHelperAlert).toEqual(true);
      component.onHelperDismissed();
      const expectedHelperKey = `${HELPER_ALERT_KEY_PREFIX}_requestShop`;
      expect(RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal).toHaveBeenCalledWith(expectedHelperKey);
      expect(component.showHelperAlert).toEqual(false);
    });
  });
});
