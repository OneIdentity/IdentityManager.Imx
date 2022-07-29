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
import { DataSourceToolbarSettings, HELPER_ALERT_KEY_PREFIX, StorageService } from 'qbm';
import { RequestConfigMembersComponent } from './request-config-members.component';
import { RequestsConfigurationTestBed } from '../test/requests-configuration-test-bed';
import { RequestsConfigurationCommonMocks } from '../test/requests-configuration-mocks';
import { MemberSelectorComponent } from './member-selector.component';

describe('RequestConfigMembersComponent', () => {
  let component: RequestConfigMembersComponent;
  let fixture: ComponentFixture<RequestConfigMembersComponent>;

  const mockDataTable: any = { clearSelection: jasmine.createSpy('clearSelection') };
  const mockDataTableExclusions: any = { clearSelection: jasmine.createSpy('clearSelection') };

  RequestsConfigurationTestBed.configureTestingModule({
      declarations: [ RequestConfigMembersComponent ],
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
    fixture = TestBed.createComponent(RequestConfigMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.dataTable = mockDataTable;
    component.dataTableExclusions = mockDataTableExclusions;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isMobile get tests', () => {
    it('should return false when the documents body offsetWidth is greater than 768', () => {
      spyOnProperty(document.body, 'offsetWidth').and.returnValue(1080);
      expect(component.isMobile).toEqual(false);
    });

    it('should return true when the documents body offsetWidth is less than or equal to 768', () => {
      spyOnProperty(document.body, 'offsetWidth').and.returnValue(480);
      expect(component.isMobile).toEqual(true);
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

  describe('openMemberSelector() tests', () => {
    let dialogOpenSpy: jasmine.Spy;
    let isMobileSpy: jasmine.Spy;
    const expectedDialogData = {
      get: jasmine.anything(), 
      GetFilterTree: jasmine.anything(), 
      isMultiValue: true
    };
    beforeEach(() => {
      dialogOpenSpy = spyOn<any>(component['matDialog'], 'open').and.callFake(() => RequestsConfigurationCommonMocks.mockDialogRef);
      isMobileSpy = spyOnProperty(component, 'isMobile');
    });
    describe('when isMobile', () => {
      it('should open the RequestsEntitySelectorComponent in a dialog with the correct params', async () => {
        isMobileSpy.and.returnValue(true);
        await component.openMemberSelector();
        expect(dialogOpenSpy).toHaveBeenCalledWith(MemberSelectorComponent, {
          width: '90vw', maxWidth: '90vw', minHeight: '60vh',
          data: expectedDialogData
        });
      });
    });
    describe('when not isMobile', () => {
      it('should open the RequestsEntitySelectorComponent in a dialog with the correct params', async () => {
        isMobileSpy.and.returnValue(false);
        await component.openMemberSelector();
        expect(dialogOpenSpy).toHaveBeenCalledWith(MemberSelectorComponent, {
          width: '60vw', maxWidth: '80vw', minHeight: '60vh',
          data: expectedDialogData
        });
      });
    });
  });

  describe('removeMembers() tests', () => {
    it('should make a call to remove the selected members for deletion', async () => {
      const mockSelections: any[] = [
        { UID_Person: { value: 'id1'} },
        { UID_Person: { value: 'id2'} }
      ];
      const mockCustomerId = 'mockCustomerId'
      const navigateSpy = spyOn<any>(component, 'navigate');
      component.dstSettings  = { dataSource: { Data: [] } } as DataSourceToolbarSettings;
      component.requestDynamicGroup = '';
      component.selectedMembers = mockSelections;
      component.customerNodeId = mockCustomerId;
      await component.removeMembers();
      expect(RequestsConfigurationCommonMocks.mockRequestsService.removeRequestConfigMembers).toHaveBeenCalledWith(mockCustomerId, '', mockSelections, '');
      expect(navigateSpy).toHaveBeenCalled();
      expect(component.dataTable.clearSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeExclusions() tests', () => {
    it('should make a call to remove the selected exclusions', async () => {
      const mockExclusions: any[] = [
        { UID_Person: { value: 'id1'} },
        { UID_Person: { value: 'id2'} }
      ];
      const navigateExcludedSpy = spyOn<any>(component, 'navigateExcludedMembers');
      component.dstSettingsExcludedMembers  = { dataSource: { Data: [] } } as DataSourceToolbarSettings;
      component.requestDynamicGroup = 'testDynRole';
      component.selectedExclusions = mockExclusions;
      await component.removeExclusions();
      expect(RequestsConfigurationCommonMocks.mockRequestsService.removeRequestConfigMemberExclusions).toHaveBeenCalledWith('testDynRole', mockExclusions);
      expect(navigateExcludedSpy).toHaveBeenCalled();
      expect(component.dataTableExclusions.clearSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe('onHelperDismissed() tests', () => {
    it('should make a call to store the dismissal of the helper alert for requestShopDetails', () => {
      RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal.calls.reset();
      component.onHelperDismissed();
      const expectedHelperKey = `${HELPER_ALERT_KEY_PREFIX}_requestShopAccess`;
      expect(RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal).toHaveBeenCalledWith(expectedHelperKey);
    });
  });
});

