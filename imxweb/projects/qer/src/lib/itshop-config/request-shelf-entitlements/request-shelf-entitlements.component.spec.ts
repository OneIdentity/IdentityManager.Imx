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
import { RequestsEntitySelectorComponent } from '../requests-selector/requests-entity-selector.component';
import { RequestsService } from '../requests.service';
import { RequestShelfEntitlementsComponent } from './request-shelf-entitlements.component';
import { RequestsConfigurationTestBed } from '../test/requests-configuration-test-bed';
import { RequestsConfigurationCommonMocks } from '../test/requests-configuration-mocks';
// TODO: Cannot import TSB here
// import { GroupsService } from 'tsb';
import { UserModelService } from '../../user/user-model.service';
import { EntitySchema, ValType } from 'imx-qbm-dbts';
import { HELPER_ALERT_KEY_PREFIX, MetadataService, StorageService } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';


xdescribe('RequestShelfEntitlementsComponent', () => {
  let component: RequestShelfEntitlementsComponent;
  let fixture: ComponentFixture<RequestShelfEntitlementsComponent>;

  const mockDataTable: any = { clearSelection: jasmine.createSpy('clearSelection') };
  const mockAdsGroup = {
    GetEntity: () => ({
      GetColumn: __ => ({
        GetValue: () => undefined
      })
    })
  };
  const mockUserModelService = {
    getGroups: jasmine.createSpy('getGroups').and.returnValue(Promise.resolve([]))
  }

  const schema: EntitySchema = {
    Columns: {
      UID_ADSGroup: {
        Type: ValType.String,
        FkRelation: {
          ParentColumnName: "UID_ADSGroup",
          ParentTableName: "ADSGroup",
          IsMemberRelation: false
        }
      }
    }
  };


  RequestsConfigurationTestBed.configureTestingModule({
    declarations: [RequestShelfEntitlementsComponent],
    providers: [
      {
        provide: QerApiService,
        useValue: {
          typedClient: {
            PortalRolesEntitlements: {
              Get: () => Promise.resolve({Data: []}),
              GetSchema: () => { return schema; }
            }
          }
        }
      },
      {
        provide: MetadataService,
        useValue: {
          GetTableMetadata: tableName => Promise.resolve({
            DisplaySingular: tableName
          })
        }
      },
      {
        provide: RequestsService,
        useValue: RequestsConfigurationCommonMocks.mockRequestsService
      },
      {
        provide: StorageService,
        useValue: RequestsConfigurationCommonMocks.mockStorageService
      },
      // TODO: GroupsService lives in TSB
      // {
      //   useValue: {
      //     getGroupDetails: jasmine.createSpy('getGroupDetails').and.returnValue(Promise.resolve(mockAdsGroup)),
      //     getGroupServiceItem: jasmine.createSpy('getGroupServiceItem').and.returnValue(Promise.resolve({})),
      //   },
      // },
      {
      }
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestShelfEntitlementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.dataTable = mockDataTable;
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
      shelfId: undefined
    };
    beforeEach(() => {
      dialogOpenSpy = spyOn<any>(component['matDialog'], 'open').and.callFake(() => RequestsConfigurationCommonMocks.mockDialogRef);
      isMobileSpy = spyOnProperty(component, 'isMobile');
    });
    describe('when isMobile', () => {
      it('should open the RequestsEntitySelectorComponent in a dialog with the correct params', async () => {
        isMobileSpy.and.returnValue(true);
        await component.openEntitlementSelector();
        expect(dialogOpenSpy).toHaveBeenCalledWith(RequestsEntitySelectorComponent, {
          width: '90vw', maxWidth: '90vw', minHeight: '60vh',
          data: expectedDialogData
        });
      });
    });
    describe('when not isMobile', () => {
      it('should open the RequestsEntitySelectorComponent in a dialog with the correct params', async () => {
        isMobileSpy.and.returnValue(false);
        await component.openEntitlementSelector();
        expect(dialogOpenSpy).toHaveBeenCalledWith(RequestsEntitySelectorComponent, {
          width: '60vw', maxWidth: '80vw', minHeight: '60vh',
          data: expectedDialogData
        });
      });
    });
  });

  describe('onHelperDismissed() tests', () => {
    it('should make a call to store the dismissal of the helper alert for requestShopDetails', () => {
      RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal.calls.reset();
      component.onHelperDismissed();
      const expectedHelperKey = `${HELPER_ALERT_KEY_PREFIX}_requestShopShelfEntitlements`;
      expect(RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal).toHaveBeenCalledWith(expectedHelperKey);
    });
  });
});
