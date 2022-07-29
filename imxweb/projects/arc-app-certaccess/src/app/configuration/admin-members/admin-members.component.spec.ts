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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { AuthenticationService, clearStylesFromDOM, HELPER_ALERT_KEY_PREFIX, SnackBarService, StorageService } from 'qbm';
import { AdminMembersService } from './admin-members.service';
import { AdminMembersComponent } from './admin-members.component';
import { PortalAdminApplicationroleMembers } from 'imx-api-qer';
import { RequestsConfigurationCommonMocks } from '../test/requests-configuration-mocks';
import { EntitySchema, ValType } from 'imx-qbm-dbts';
import { ArcApiService } from '../../services/arc-api-client.service';

describe('AdminMembersComponent', () => {
  let component: AdminMembersComponent;
  let fixture: ComponentFixture<AdminMembersComponent>;

  const adminMembers = {
    createNew: __ => ({ GetEntity: __ => ({ GetFkCandidateProvider: __ => ({ getProviderItem: (_cn, _tn) => ({ parameterNames: [] }) }) }) }),
    add: jasmine.createSpy('add'),
    delete: jasmine.createSpy('delete'),
    get: jasmine.createSpy('get'),
    adminApplicationRoleMembersSchema: {
      Columns: {
        __Display: { ColumnName: '__Display' },
        UID_Person: { ColumnName: 'UID_Person', FkRelation: { ParentColumnName: '', ParentTableName: ''} }
      }
    }
  };

  const uidAeRole = 'some role id';

  const sidesheetData = {
    role: {
      GetEntity: () => ({
        GetKeys: () => [uidAeRole],
        GetDisplayLong: () => undefined
      }),
      Description: { Column: { GetDisplayValue: () => undefined } }
    }
  };

  const membersToAdd = ['some member id'];

  const schema: EntitySchema = {
    Columns: {
      UID_Person: {
        Type: ValType.String,
        FkRelation: {
          ParentColumnName: "UID_Person",
          ParentTableName: "Person",
          IsMemberRelation: false
        }
      }
    }
  };

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      declarations: [
        AdminMembersComponent
      ],
      imports: [
        MatDialogModule,        
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ArcApiService,
          useValue: {
            typedClient: {
              PortalAdminApplicationroleMembers: {
                GetSchema: () => schema
              }
            }
          }
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: AdminMembersService,
          useValue: adminMembers
        },
        {
          provide: StorageService,
          useValue: RequestsConfigurationCommonMocks.mockStorageService
        },
        {
          provide: MatDialog,
          useValue: {
            open: __ => ({ afterClosed: __ => ({ toPromise: __ => Promise.resolve(membersToAdd) }) })
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            onSessionResponse: new Subject()
          }
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sidesheetData
        }
      ]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    adminMembers.add.calls.reset();
    adminMembers.delete.calls.reset();
    adminMembers.get.calls.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls add for selected candidates and gets the updated collection', async () => {
    await component.add();

    expect(adminMembers.add).toHaveBeenCalledWith(uidAeRole, membersToAdd);
    expect(adminMembers.get).toHaveBeenCalled();
  });

  it('calls delete for selected members and gets the updated collection', async () => {
    const membersToDelete = [{}] as PortalAdminApplicationroleMembers[];

    component.selectionChanged(membersToDelete);

    await component.delete();

    expect(adminMembers.delete).toHaveBeenCalledWith(uidAeRole, membersToDelete);
    expect(adminMembers.get).toHaveBeenCalled();
  });

  describe('onHelperDismissed() tests', () => {
    it('should make a call to store the dismissal of the helper alert', () => {
      RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal.calls.reset();

      expect(component.showHelperAlert).toEqual(true);
      component.onHelperDismissed();
      const expectedHelperKey = `${HELPER_ALERT_KEY_PREFIX}_adminMembers`;
      expect(RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal).toHaveBeenCalledWith(expectedHelperKey);      
      expect(component.showHelperAlert).toEqual(false);
    });
  });
});
