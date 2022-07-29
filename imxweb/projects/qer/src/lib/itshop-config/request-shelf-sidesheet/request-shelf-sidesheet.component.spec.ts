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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { ACTION_DISMISS, RequestsService } from '../requests.service';
import { RequestShelfSidesheetComponent } from './request-shelf-sidesheet.component';
import { RequestsConfigurationTestBed } from '../test/requests-configuration-test-bed';
import { RequestsConfigurationCommonMocks } from '../test/requests-configuration-mocks';
import { HELPER_ALERT_KEY_PREFIX, StorageService } from 'qbm';

describe('RequestShelfSidesheetComponent', () => {
  let component: RequestShelfSidesheetComponent;
  let fixture: ComponentFixture<RequestShelfSidesheetComponent>;

  let sidesheetCloseSpy: jasmine.Spy;

  RequestsConfigurationTestBed.configureTestingModule({
      declarations: [ RequestShelfSidesheetComponent ],
      imports: [ NoopAnimationsModule ],
      providers: [
        {
          provide: RequestsService,
          useValue: RequestsConfigurationCommonMocks.mockRequestsService
        },
        {
          provide: StorageService,
          useValue: RequestsConfigurationCommonMocks.mockStorageService
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: { isNew: false, requestConfig: RequestsConfigurationCommonMocks.mockRequestConfig },
        },
      ],
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestShelfSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    sidesheetCloseSpy = spyOn<any>(component['sidesheet'], 'close');
    sidesheetCloseSpy.calls.reset();

    RequestsConfigurationCommonMocks.mockRequestsService.manageShelfDeleteStatus.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getter tests', () => {

    describe('shelfHasEntitlements get tests', () => {
      it('should return `true` when there is an entitlementCount > 0', () => {
        component['entitlementCount'] = 2;
        expect(component.shelfHasEntitlements).toEqual(true);
      });
      it('should return `false` when there is not an entitlementCount > 0', () => {
        component['entitlementCount'] = undefined;
        expect(component.shelfHasEntitlements).toEqual(false);
      });
    });

    describe('deleteHelperTooltip get tests', () => {
      it('should return a string detailing why delete is disabled when there is a shelf or member count', () => {
        const expectedTooltipText = '#LDS#To enable deletion, remove all assigned products.';
        component['entitlementCount'] = 1;
        expect(component.deleteHelperTooltip).toEqual(expectedTooltipText);
      });

      it('should return a string detailing why delete is disabled when an entitlement was recently deleted', () => {
        const expectedTooltipText = '#LDS#Currently, products are being removed. Deletion will be enabled in a few moments.';
        component['entitlementCount'] = 0;
        component.requestsService.shelvesBlockedDeleteStatus['testId'] = true;
        expect(component.deleteHelperTooltip).toEqual(expectedTooltipText);
      });

      it('should return an empty string when there are no shelves or member counts', () => {
        component['entitlementCount'] = undefined;
        component.requestsService.shelvesBlockedDeleteStatus = {};
        expect(component.deleteHelperTooltip).toEqual('');
      });
    });

    describe('entitlementRecentlyDeleted get tests', () => {
      let selectedShelfIdSpy: jasmine.Spy;
      beforeEach(() => {
        selectedShelfIdSpy = spyOnProperty(component, 'selectedShelfId');
      });
      it(`should return false if there is no value for the selectedShelfId or the service
      reports false for the given selectedShelfId`, () => {
        selectedShelfIdSpy.and.returnValue(undefined);
        expect(component.entitlementRecentlyDeleted).toEqual(false);
        selectedShelfIdSpy.and.returnValue('testId');
        component.requestsService.shelvesBlockedDeleteStatus['testId'] = false;
        expect(component.entitlementRecentlyDeleted).toEqual(false);
      });
      it(`should return true when the service shelvesBlockedDeleteStatus has an entry
      for the selectedShelfId that is true`, () => {
        selectedShelfIdSpy.and.returnValue('testId');
        component.requestsService.shelvesBlockedDeleteStatus['testId'] = true;
        expect(component.entitlementRecentlyDeleted).toEqual(true);
      });
    });
  });
  describe('cancel() tests', () => {
    it('should make a call to close the sidesheet', () => {
      component.cancel();
      expect(sidesheetCloseSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('onEntitlementCountUpdated() tests', () => {
    beforeEach(() => {
      component['entitlementCount'] = undefined;
    });
    describe('when entitlements have not recently been deleted', () => {
      it(`should set entitlementCount to the supplied value and not call the service
      to manage the delete status`, () => {
        const updateData = { count: 3, recentDeleteAction: false };
        component.onEntitlementCountUpdated(updateData);
        expect(component['entitlementCount']).toEqual(3);
        expect(component.requestsService.manageShelfDeleteStatus).not.toHaveBeenCalled();
      });
    });
    describe('when entitlements have recently been deleted', () => {
      it(`should set entitlementCount to the supplied value but not call the service to manage
      the delete status when the entitlement count is still greater than 0`, () => {
        const updateData = { count: 2, recentDeleteAction: true };
        component.onEntitlementCountUpdated(updateData);
        expect(component['entitlementCount']).toEqual(2);
        expect(component.requestsService.manageShelfDeleteStatus).not.toHaveBeenCalled();
      });
      it(`should set entitlementCount to the supplied value and make a call to the service
      to manage the delete status when the remaining entitlement count is 0`, () => {
        const updateData = { count: 0, recentDeleteAction: true };
        component.onEntitlementCountUpdated(updateData);
        expect(component['entitlementCount']).toEqual(0);
        expect(component.requestsService.manageShelfDeleteStatus).toHaveBeenCalledWith('testId');
      });
    });
  });
  describe('delete() tests', () => {
    it('should use the requests service to process a delete request for the selected request shop', async () => {
      const expectedDeleteConfirmation = '#LDS#The shelf has been successfully deleted.';
      await component.delete();
      expect(component.requestsService.deleteRequestConfiguration).toHaveBeenCalledWith('testId');
      expect(component.requestsService.openSnackbar).toHaveBeenCalledWith(expectedDeleteConfirmation, ACTION_DISMISS);
      expect(sidesheetCloseSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('saveShelf() tests', () => {
    let createNewSpy: jasmine.Spy;
    let processSaveSpy: jasmine.Spy;
    let entityCommitSpy: jasmine.Spy;
    beforeEach(() => {
      createNewSpy = spyOn<any>(component, 'createNew');
      processSaveSpy = spyOn<any>(component, 'processSaveConfirmation');
      entityCommitSpy = spyOn(component.data.requestConfig.GetEntity(), 'Commit');
    });
    it('should call `createNew` when `data.isNew` is true', async () => {
      component.data.isNew = true;
      await component.saveShelf();
      expect(createNewSpy).toHaveBeenCalled();
      expect(entityCommitSpy).not.toHaveBeenCalled();

    });
    it('should call `.commit()` on the entity when `data.isNew` is false', async () => {
      component.data.isNew = false;
      await component.saveShelf();
      expect(createNewSpy).not.toHaveBeenCalled();
      expect(entityCommitSpy).toHaveBeenCalled();
      expect(processSaveSpy).toHaveBeenCalled();
    });
  });
  describe('onHelperDismissed() tests', () => {
    it('should make a call to store the dismissal of the helper alert for requestShopDetails', () => {
      RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal.calls.reset();
      component.onHelperDismissed();
      const expectedHelperKey = `${HELPER_ALERT_KEY_PREFIX}_requestShopShelfDetails`;
      expect(RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal).toHaveBeenCalledWith(expectedHelperKey);
    });
  });
});
