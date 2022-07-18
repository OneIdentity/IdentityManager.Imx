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


import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { EuiLoadingService, EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ApplicationDetailsComponent } from './application-details.component';
import { EntitlementsService } from '../../entitlements/entitlements.service';
import { ShopsService } from '../../shops/shops.service';
import { PortalEntitlement, PortalApplication, PortalShops, PortalApplicationusesaccount } from 'imx-api-aob';
import { clearStylesFromDOM, ConfirmationService, SnackBarService } from 'qbm';
import { AccountsService } from '../../accounts/accounts.service';
import { LifecycleActionComponent } from '../../lifecycle-actions/lifecycle-action.component';
import { LifecycleAction } from '../../lifecycle-actions/lifecycle-action.enum';
import { ApplicationsService } from '../applications.service';
import { AobApiService } from '../../aob-api-client.service';
import { AobPermissionsService } from '../../permissions/aob-permissions.service';

@Component({
  selector: 'imx-user',
  template: '<p>MockUserComponent</p>'
})
class MockUserComponent {
  @Input() public uid: any;
  @Input() public role: any;
  @Input() public noUserText: string;
  @Input() public size: 'default' | 'large' = 'default';
  public imageUrl: any;
  public primaryValue: string;
  public secondaryValue: string;
  public hasUser: boolean;
}

@Component({
  selector: 'imx-column-info',
  template: '<p>MockColumInfoComponent</p>'
})
class MockColumInfoComponent {
  @Input() public value: any;
  @Input() public property: any;
  @Input() public icon: any;
  @Input() public placeholder: string;
}

@Component({
  selector: 'imx-application-property',
  template: '<p>MockApplicationPropertyComponent</p>'
})
class MockApplicationPropertyComponent {
  @Input() public display: any;
  @Input() public icon: any;
}

@Pipe({ name: 'ldsReplace' })
class MockLdsReplacePipe implements PipeTransform {
  transform() { }
}

describe('ApplicationDetailsComponent', () => {
  let component: ApplicationDetailsComponent;
  let fixture: ComponentFixture<ApplicationDetailsComponent>;

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  let result: any;
  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(result) }),
    closeAll: jasmine.createSpy('closeAll')
  };

  const mockApplicationService = {
    publish: jasmine.createSpy('publish').and.returnValue(Promise.resolve(true)),
    unpublish: jasmine.createSpy('unpublish').and.returnValue(Promise.resolve(true)),
  }

  const entities =
    [
      {
        Ident_AOBEntitlement: { value: 'test1' },
        UID_AOBApplication: { value: 'abcd' },
        IsInActive: { value: true },
        ActivationDate: {value: ''}
      },
      {
        Ident_AOBEntitlement: { value: 'test2' },
        UID_AOBApplication: { value: 'abcd' },
        IsInActive: { value: false },
        ActivationDate: {value: ''}
      },
      {
        Ident_AOBEntitlement: { value: 'test3' },
        UID_AOBApplication: { value: 'abcd' },
        IsInActive: { value: true },
        ActivationDate: {value: ''}
      },
      {
        Ident_AOBEntitlement: { value: 'test4' },
        UID_AOBApplication: { value: 'abcde' },
        IsInActive: { value: true },
        ActivationDate: {value: ''}
      }
    ] as unknown as PortalEntitlement[];

  const mockEntitlementsService = {
    get: jasmine.createSpy('get').and.returnValue(Promise.resolve({ totalCount: entities.length, Data: entities })),
    getEntitlementsForApplication: jasmine.createSpy('getEntitlementsForApplication').and
      .returnValue(Promise.resolve({ totalCount: 3, Data: entities.filter(ent => ent.UID_AOBApplication.value === 'abcd') }))
  }

  const mockShops = [{}];
  const mockShopsService = {
    getApplicationInShop: jasmine.createSpy('getApplicationInShop').and.returnValue(Promise.resolve({ totalCount: mockShops.length, Data: mockShops }))
  };

  function createAobApplicationMock(image: string = ''): PortalApplication {
    return {
      UID_AOBApplication: {
        value: 'abc',
        Column: { GetDisplayValue: (_) => 'UID' }
      },
      Description: {
        value: "entitlement Description",
        Column: { GetDisplayValue: (_) => 'some other description' }
      },
      JPegPhoto: {
        value: image
      },
      UID_PersonHead: {
        value: "uid",
        Column: { GetDisplayValue: (_) => 'UID_PersonHead' }
      },
      IsInActive: {
        value: false,
        GetMetadata: (_) => { return { CanEdit: () => true } }
      },
      ActivationDate: {
        value: null,
        Column: { GetDisplayValue: (_) => 'ActivationDate' },
        GetMetadata: (_) => { return { CanEdit: () => true } }
      },
      AuthenticationRoot: {
        value: null,
        GetMetadata: () => ({})
      },
      GetEntity: () => ({ GetDisplay: () => 'some other' })
    } as PortalApplication;
  }

  const accountsServiceStub = {
    getAssigned: jasmine.createSpy('getAssigned').and.returnValue(Promise.resolve([])),
    getFirstAndCount: jasmine.createSpy('getFirstAndCount').and.returnValue(Promise.resolve({ first: undefined, count: 0 }))
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ApplicationDetailsComponent,
        MockColumInfoComponent,
        MockUserComponent,
        MockApplicationPropertyComponent,
        MockLdsReplacePipe
      ],
      imports: [
        EuiCoreModule,
        LoggerTestingModule,
        MatCardModule,
        MatDividerModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: AobApiService,
          useValue: {
            typedClient: {
              PortalApplicationusesaccount: {
                GetSchema: () => PortalApplicationusesaccount.GetEntitySchema()
              },
              PortalShops: {
                GetSchema: () => PortalShops.GetEntitySchema()
              }
            }
          }
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: ApplicationsService,
          useValue: mockApplicationService
        },
        {
          provide: EntitlementsService,
          useValue: mockEntitlementsService
        },
        {
          provide: ShopsService,
          useValue: mockShopsService
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: AccountsService,
          useValue: accountsServiceStub
        },
        {
          provide: AobPermissionsService,
          useValue: {
            isAobApplicationAdmin: jasmine.createSpy('isAobApplicationAdmin').and.returnValue(Promise.resolve(true))
          }
        },
        {
          provide: ConfirmationService,
          useValue: {
            confirm: jasmine.createSpy('confirm').and.returnValue(Promise.resolve(true))
          }
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    mockRouter.navigate.calls.reset();
    mockShopsService.getApplicationInShop.calls.reset();
    euiLoadingServiceStub.hide.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
    accountsServiceStub.getAssigned.calls.reset();
  }));

  beforeEach(() => {
    const aobApplicationMock = createAobApplicationMock() as PortalApplication;
    fixture = TestBed.createComponent(ApplicationDetailsComponent);
    component = fixture.componentInstance;
    component.application = aobApplicationMock;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('could be refreshed by angular', async () => {
    fixture.detectChanges();
    await component.ngOnChanges();
    expect(component.hasOwner).toBeTruthy();
    expect(component.hasAssignedEntitlements).toBeTruthy();
    expect(component.hasPublishedEntitlements).toBeTruthy();
  });

  it('checks, if an ItShop is assigned', async () => {
    fixture.detectChanges();
    await component.ngOnChanges();
    expect(mockShopsService.getApplicationInShop).toHaveBeenCalled();
    expect(component.assignedShops.length).toBeGreaterThan(0);
  });

  it('changes tab', async () => {
    fixture.detectChanges();
    await component.ngOnChanges();
  });

  [
    {
      description: 'published application',
      value: {
        IsInActive: { value: false, GetMetadata: (_) => { return { CanEdit: () => true } } },
        ActivationDate: {
          value: new Date(Date.now()), GetMetadata: (_) => { return { CanEdit: () => true } }
        }
      }
      , expected: true
    },
    {
      description: 'unpublished application',
      value: {
        IsInActive: { value: true, GetMetadata: (_) => { return { CanEdit: () => true } } },
        ActivationDate: {
          value: null, GetMetadata: (_) => { return { CanEdit: () => true } }
        }
      }
      , expected: false
    },
    {
      description: 'application to be published in the future',
      value: {
        IsInActive: { value: true, GetMetadata: (_) => { return { CanEdit: () => true } } },
        ActivationDate: {
          value: new Date(Date.now() + 300), GetMetadata: (_) => { return { CanEdit: () => true } }
        }
      }
      , expected: true
    }
  ].forEach(element => {
    it(`checks if an application is unpublishable (${element.description})`, () => {
      component.application = element.value as PortalApplication;
      expect(component.isUnpublishable).toEqual(element.expected);
    });
  });

  [
    {
      description: 'published application',
      value: {
        IsInActive: { value: false, GetMetadata: (_) => { return { CanEdit: () => true } } },
        ActivationDate: {
          value: new Date(Date.now()), GetMetadata: (_) => { return { CanEdit: () => true } }
        }
      }
      , expected: false
    },
    {
      description: 'unpublished application',
      value: {
        IsInActive: { value: true, GetMetadata: (_) => { return { CanEdit: () => true } } },
        ActivationDate: {
          value: null, GetMetadata: (_) => { return { CanEdit: () => true } }
        }
      }
      , expected: true
    },
    {
      description: 'application to be published in the future',
      value: {
        IsInActive: { value: true, GetMetadata: (_) => { return { CanEdit: () => true } } },
        ActivationDate: {
          value: new Date(Date.now() + 300), GetMetadata: (_) => { return { CanEdit: () => true } }
        }
      }
      , expected: true
    }
  ].forEach(element => {
    it(`checks if an application is publishable (${element.description})`, () => {
      component.application = element.value as PortalApplication;
      expect(component.isPublishable).toEqual(element.expected);
    });
  });

  [
    { action: LifecycleAction.Unpublish, mode: 'unpublish', resultOpen: false },
    { action: LifecycleAction.Unpublish, mode: 'unpublish', resultOpen: true },
    { action: LifecycleAction.Publish, mode: 'publish', resultOpen: false },
    { action: LifecycleAction.Publish, mode: 'publish', resultOpen: true }
  ].forEach(testcase => {
    it(`could open ${testcase.mode}-dialog for single element`, async () => {
      mockMatDialog.open.calls.reset();
      // Arrange
      result = testcase.resultOpen;
      const applicationStub = {
        IsInActive: { value: true },
        ActivationDate: { value: null },
        UID_AOBApplication: { value: '' },
        GetEntity: () => ({
          GetDisplay: () => 'name1'
        })
      } as unknown;

      component.application = applicationStub as PortalApplication;

      // Act
      if (testcase.action == LifecycleAction.Unpublish) {
        await component.unpublishApplication(null);
      } else {
        await component.publishApplication(null);
      }

      // Assert
      if (testcase.action == LifecycleAction.Publish) {
        expect(mockMatDialog.open).toHaveBeenCalledWith(LifecycleActionComponent, {
          data: {
            action: testcase.action,
            elements: [component.application],
            shops: mockShops,
            type: 'AobApplication'
          }, height: 'auto'
        });
      } else {
        expect(mockMatDialog.open).toHaveBeenCalledWith(LifecycleActionComponent, {
          data: {
            action: testcase.action,
            elements: [component.application],
            type: 'AobApplication'
          },
          width: '800px',
          height: '500px'
        });
      }
    });
  });
});
