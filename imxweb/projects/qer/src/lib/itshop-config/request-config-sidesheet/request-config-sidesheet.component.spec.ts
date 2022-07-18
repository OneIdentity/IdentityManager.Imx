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
import { RequestConfigSidesheetComponent } from './request-config-sidesheet.component';
import { RequestsConfigurationTestBed } from '../test/requests-configuration-test-bed';
import { RequestsConfigurationCommonMocks } from '../test/requests-configuration-mocks';
import { HELPER_ALERT_KEY_PREFIX, StorageService} from 'qbm';

describe('RequestConfigSidesheetComponent', () => {
  let component: RequestConfigSidesheetComponent;
  let fixture: ComponentFixture<RequestConfigSidesheetComponent>;

  let sidesheetCloseSpy: jasmine.Spy;

  RequestsConfigurationTestBed.configureTestingModule({
    declarations: [ RequestConfigSidesheetComponent ],
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
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestConfigSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    sidesheetCloseSpy = spyOn<any>(component['sidesheet'], 'close');
    sidesheetCloseSpy.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getter tests', () => {

    describe('selectedRequestConfigKey get tests', () => {
      it('should return the key of the selected request shop', () => {
        expect(component.selectedRequestConfigKey).toEqual('testId');
      });
    });

    describe('requestConfigContainsShelves get tests', () => {
      it('should return `true` when there is a shelfCount > 0', () => {
        component['shelfCount'] = 2;
        expect(component.requestConfigContainsShelves).toEqual(true);
      });
      it('should return `false` when there is not a shelfCount > 0', () => {
        component['shelfCount'] = undefined;
        expect(component.requestConfigContainsShelves).toEqual(false);
      });
    });

    describe('requestConfigHasMembers get tests', () => {
      it('should return `true` when there is a memberCount > 0', () => {
        component['memberCount'] = 3;
        expect(component.requestConfigHasMembers).toEqual(true);
      });
      it('should return `false` when there is not a memberCount > 0', () => {
        component['memberCount'] = undefined;
        expect(component.requestConfigHasMembers).toEqual(false);
      });
    });

    describe('deleteHelperTooltip get tests', () => {
      it('should return a string detailing why delete is disabled when there is a shelf or member count', () => {
        const expectedTooltipText = '#LDS#To enable deletion, remove all shelves and access members.';
        component['shelfCount'] = 1;
        expect(component.deleteHelperTooltip).toEqual(expectedTooltipText);
        component['shelfCount'] = undefined;
        component['memberCount'] = 1;
        expect(component.deleteHelperTooltip).toEqual(expectedTooltipText);

      });

      it('should return an empty string when there are no shelves or member counts', () => {
        component['shelfCount'] = undefined;
        component['memberCount'] = undefined;
        expect(component.deleteHelperTooltip).toEqual('');
      });
    });
  });

  describe('cancel() tests', () => {
    it('should make a call to close the sidesheet', () => {
      component.cancel();
      expect(sidesheetCloseSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('onShelfCountUpdated() tests', () => {
    it('should set shelfCount to the supplied value', () => {
      component['shelfCount'] = undefined;
      component.onShelfCountUpdated(3);
      expect(component['shelfCount']).toEqual(3);
    });
  });
  describe('onMemberCountUpdated() tests', () => {
    it('should set shelfCount to the supplied value', () => {
      component['memberCount'] = undefined;
      component.onMemberCountUpdated(1);
      expect(component['memberCount']).toEqual(1);
    });
  });
  describe('delete() tests', () => {
    it('should use the requests service to process a delete request for the selected request shop', async () => {
      const expectedDeleteConfirmation = '#LDS#The shop has been successfully deleted.';
      await component.delete();
      expect(component.requestsService.deleteRequestConfiguration).toHaveBeenCalledWith('testId');
      expect(component.requestsService.openSnackbar).toHaveBeenCalledWith(expectedDeleteConfirmation, ACTION_DISMISS);
      expect(sidesheetCloseSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('saveRequestConfig() tests', () => {
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
      await component.saveRequestConfig();
      expect(createNewSpy).toHaveBeenCalled();
      expect(entityCommitSpy).not.toHaveBeenCalled();

    });
    it('should call `.commit()` on the entity when `data.isNew` is false', async () => {
      component.data.isNew = false;
      await component.saveRequestConfig();
      expect(createNewSpy).not.toHaveBeenCalled();
      expect(entityCommitSpy).toHaveBeenCalled();
      expect(processSaveSpy).toHaveBeenCalled();
    });
  });
  describe('onHelperDismissed() tests', () => {
    it('should make a call to store the dismissal of the helper alert for requestShopDetails', () => {
      RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal.calls.reset();
      component.onHelperDismissed();
      const expectedHelperKey = `${HELPER_ALERT_KEY_PREFIX}_requestShopDetails`;
      expect(RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal).toHaveBeenCalledWith(expectedHelperKey);
    });
  });
});
