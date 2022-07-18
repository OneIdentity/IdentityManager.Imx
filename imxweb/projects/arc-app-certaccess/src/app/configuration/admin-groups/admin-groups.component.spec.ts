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
import { MatTableModule } from '@angular/material/table';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PortalAdminApplicationrole } from 'imx-api-qer';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM, HELPER_ALERT_KEY_PREFIX, StorageService } from 'qbm';
import { AdminMembersService } from '../admin-members/admin-members.service';
import { RequestsConfigurationCommonMocks } from '../test/requests-configuration-mocks';
import { AdminGroupsComponent } from './admin-groups.component';

describe('AdminGroupsComponent', () => {
  let component: AdminGroupsComponent;
  let fixture: ComponentFixture<AdminGroupsComponent>;

  const sidesheetService = {
    open: jasmine.createSpy('open')
  };

  const adminMembers = {
    getGroupInfo: jasmine.createSpy('getGroupInfo'),
    adminApplicationRoleSchema: {
      Columns: {
        __Display: { ColumnName: '__Display' },
        Description: { ColumnName: 'Description' },
      }
    }
  };

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      declarations: [
        AdminGroupsComponent
      ],
      imports: [
        MatTableModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      providers: [
        {
          provide: EuiSidesheetService,
          useValue: sidesheetService
        },
        {
          provide: StorageService,
          useValue: RequestsConfigurationCommonMocks.mockStorageService
        },
        {
          provide: AdminMembersService,
          useValue: adminMembers
        }
      ]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    adminMembers.getGroupInfo.calls.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show sidesheet', async () => {
    await component.editRoleMembership({} as PortalAdminApplicationrole);
    expect(sidesheetService.open).toHaveBeenCalled();
  });

  it('gets group info', async () => {
    await component.getData();

    expect(adminMembers.getGroupInfo).toHaveBeenCalled();
  });

  describe('onHelperDismissed() tests', () => {
    it('should make a call to store the dismissal of the helper alert', () => {
      RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal.calls.reset();
      
      expect(component.showHelperAlert).toEqual(true);
      component.onHelperDismissed();
      const expectedHelperKey = `${HELPER_ALERT_KEY_PREFIX}_adminGroups`;
      expect(RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal).toHaveBeenCalledWith(expectedHelperKey);
      expect(component.showHelperAlert).toEqual(false);
    });
  });
});
