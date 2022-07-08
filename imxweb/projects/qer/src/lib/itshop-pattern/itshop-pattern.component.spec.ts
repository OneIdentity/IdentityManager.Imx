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
 * Copyright 2021 One Identity LLC.
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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of, Subject } from 'rxjs';

import { IClientProperty } from 'imx-qbm-dbts';

import { AuthenticationService, ClassloggerService, clearStylesFromDOM, ConfirmationService, ISessionState, SnackBarService } from 'qbm';
import { ItshopPatternComponent } from './itshop-pattern.component';
import { ItshopPatternService } from './itshop-pattern.service';
import { PortalItshopPatternAdmin } from 'imx-api-qer';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { QerPermissionsService } from '../admin/qer-permissions.service';
import { ActivatedRoute } from '@angular/router';
import { ItshopPatternCreateService } from './itshop-pattern-create-sidesheet/itshop-pattern-create.service';

describe('ItshopPatternComponent', () => {
  let component: ItshopPatternComponent;
  let fixture: ComponentFixture<ItshopPatternComponent>;

  const sidesheetServiceStub = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) }),
  };

  const authenticationServiceStub = {
    onSessionResponse: new Subject<ISessionState>(),
  };

  const patterServiceStub = {
    itshopPatternAdminSchema: { Columns: { __Display: { ColumnName: '__DisplayAdmin' } as IClientProperty } },
    itshopPatternPrivateSchema: { Columns: { __Display: { ColumnName: '__DisplayPrivate' } as IClientProperty } },
    getPublicPatterns: jasmine.createSpy('getPublicPatterns').and.returnValue({}),
    getPrivatePatterns: jasmine.createSpy('getPrivatePatterns').and.returnValue({}),
    getPrivatePattern: jasmine.createSpy('getPrivatePattern').and.returnValue({}),
    makePublic: jasmine.createSpy('makePublic').and.returnValue({}),
    delete: jasmine.createSpy('delete').and.returnValue({}),
    createCopy: jasmine.createSpy('createCopy').and.returnValue({}),
    handleOpenLoader: jasmine.createSpy('handleOpenLoader').and.callThrough(),
    handleCloseLoader: jasmine.createSpy('handleCloseLoader').and.callThrough(),
  }

  const patterCreateServiceStub = {
    createNewPattern: jasmine.createSpy('createNewPattern').and.callThrough(),
  }

  let isShopAdmin = false;
  const qerPermissionsServiceStub = {
    isShopAdmin: jasmine.createSpy('isShopAdmin').and.callFake(() => isShopAdmin)
  };

  let routeConfigPath = 'configuration/requesttemplates';
  const activatedRouteStub = {
    snapshot: {
      routeConfig: { path: routeConfigPath }
    }
  };

  const uid = '123';
  const selectedPattern = {
    GetEntity: () => ({
      GetKeys: () => [uid],
      GetDisplayLong: () => 'longDisplay',
      GetColumn: () => ({ GetValue: () => ({}) }),
    }),
    IsPublicPattern: {
      value: false
    },
    UID_Person: {
      value: true,
      Column: { GetDisplayValue: (_) => 'UID_Person' }
    },
  } as any as PortalItshopPatternAdmin;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ItshopPatternComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        {
          provide: ItshopPatternService,
          useValue: patterServiceStub
        },
        {
          provide: ItshopPatternCreateService,
          useValue: patterCreateServiceStub
        },
        {
          provide: EuiSidesheetService,
          useValue: sidesheetServiceStub
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: QerPermissionsService,
          useValue: qerPermissionsServiceStub,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: AuthenticationService,
          useValue: authenticationServiceStub,
        },
        {
          provide: ClassloggerService,
          useValue: {
            debug: jasmine.createSpy('debug').and.callThrough(),
            trace: jasmine.createSpy('trace').and.callThrough()
          }
        },
        {
          provide: ConfirmationService,
          useValue:{
            confirm: jasmine.createSpy('confirm')
              .and.callFake(() => Promise.resolve(confirm))
          }
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(waitForAsync(() => {
    patterServiceStub.makePublic.calls.reset();
    patterServiceStub.createCopy.calls.reset();
    patterServiceStub.getPrivatePatterns.calls.reset();
    patterServiceStub.getPublicPatterns.calls.reset();
    patterServiceStub.delete.calls.reset();
    sidesheetServiceStub.open.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItshopPatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  for (const testcase of [
    { adminMode: true, description: 'admin-mode' },
    { adminMode: false, description: 'normaö-user-mode' },
  ]) {
    xit(`should run the component in  ${testcase.description}`, async () => {
      patterServiceStub.getPrivatePatterns.calls.reset();
      patterServiceStub.getPublicPatterns.calls.reset();
      const state = { OrderBy: 'Ident_ShoppingCartPattern asc' };
      if (testcase.adminMode) {
        routeConfigPath = 'configuration/requesttemplates';
        isShopAdmin = true;
      } else {
        routeConfigPath = 'something else';
        isShopAdmin = false;
      }

      await component.ngOnInit();

      if (testcase.adminMode) {
        expect(patterServiceStub.getPublicPatterns).toHaveBeenCalledWith(state);
        expect(patterServiceStub.getPrivatePatterns).not.toHaveBeenCalled();
      } else {
        expect(patterServiceStub.getPrivatePatterns).toHaveBeenCalledWith(state);
        expect(patterServiceStub.getPublicPatterns).not.toHaveBeenCalled();
      }
    });
  }

  it('should open the details sidesheet', async () => {
    await component.viewDetails(selectedPattern);

    expect(sidesheetServiceStub.open).toHaveBeenCalled();
  });

  for (const testcase of [
    { publish: true, description: 'publish' },
    { publish: false, description: 'unpublish' },
  ]) {
    it(`should ${testcase.description} the selected patterns`, async () => {

      const getDataSpy = spyOn<any>(component, 'getData');
      const mockDataTable: any = { clearSelection: jasmine.createSpy('clearSelection') };
      component.table = mockDataTable;

      if (testcase.publish) {
        await component.publish([selectedPattern]);
      } else {
        await component.unpublish([selectedPattern]);
      }

      expect(getDataSpy).toHaveBeenCalled();
      expect(mockDataTable.clearSelection).toHaveBeenCalledTimes(1);
      expect(patterServiceStub.makePublic).toHaveBeenCalledOnceWith([selectedPattern], testcase.publish);

    });
  }

  it(`should delete the selected patterns`, async () => {
    const getDataSpy = spyOn<any>(component, 'getData');
    const mockDataTable: any = { clearSelection: jasmine.createSpy('clearSelection') };
    component.table = mockDataTable;

    await component.delete(selectedPattern);

    expect(getDataSpy).toHaveBeenCalled();
    expect(mockDataTable.clearSelection).toHaveBeenCalledTimes(1);
    expect(patterServiceStub.delete).toHaveBeenCalledOnceWith([selectedPattern]);
  });

});
