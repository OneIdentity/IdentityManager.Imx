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

import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { EuiCoreModule, EuiLoadingService, EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { configureTestSuite } from 'ng-bullet';
import { of, Subject } from 'rxjs';

import { PortalCartitem } from 'imx-api-qer';
import { IEntity } from 'imx-qbm-dbts';

import { AuthenticationService, EntityService, clearStylesFromDOM } from 'qbm';
import { ShelfService } from '../../itshop/shelf.service';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { QerApiService } from '../../qer-api-client.service';
import { ServiceItemsService } from '../../service-items/service-items.service';
import { CartItemsService } from '../../shopping-cart/cart-items.service';
import { ItshopPatternCreateService } from '../itshop-pattern-create-sidesheet/itshop-pattern-create.service';
import { ItshopPatternAddProductsComponent } from './itshop-pattern-add-products.component';
import { UserModelService } from '../../user/user-model.service';

describe('ItshopPatternAddProductsComponent', () => {
  let component: ItshopPatternAddProductsComponent;
  let fixture: ComponentFixture<ItshopPatternAddProductsComponent>;

  const sidesheetData = {
    shoppingCartPatternUid: 'uid'
  };

  const testHelper = {
    euiLoadingServiceStub: {
      hide: jasmine.createSpy('hide'),
      show: jasmine.createSpy('show')
    },
    cartItemsServiceStub: {
      createCartItems: jasmine.createSpy('createCartItems')
    },
    entityServiceStub: {
      useValue: {
        createLocalEntityColumn: jasmine.createSpy('createLocalEntityColumn').and.returnValue({})
      }
    },
    patterCreateServiceStub: {
      assignItemsToPattern: jasmine.createSpy('assignItemsToPattern').and.callThrough(),
    },
    projectConfigurationServiceStub: {
      getConfig: () => Promise.resolve({})
    },
    qerApiServiceStub: {
      typedClient: {
        PortalShopCategories: {
          GetSchema: () => ({ Columns: [] }),
        },
        PortalCartitem: {
          GetSchema: () => ({ Columns: [] }),
          createEntity: jasmine.createSpy('createEntity').and.returnValue({
            GetEntity: () => ({

            }) as unknown as IEntity,

          } as unknown as PortalCartitem)
        },
      },
      client: {
        getFkProviderItems: jasmine.createSpy('getFkProviderItems')
      },
    },
    sidesheetServiceStub: {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of({})
      })
    },
    sidesheetRefStub: {
      close: jasmine.createSpy('close'),
      closeClicked: jasmine.createSpy('closeClicked').and.returnValue(of(undefined))
    },
    serviceItemsServiceStub: {
      getServiceItemsForPersons: jasmine.createSpy('getServiceItemsForPersons')
    },
    translateServiceStub: {
      onLangChange: { subscribe: () => { } },
      onTranslationChange: { subscribe: () => { } },
      onDefaultLangChange: { subscribe: () => { } },
      addLangs: jasmine.createSpy('addLangs'),
      getLangs: jasmine.createSpy('getLangs'),
      getBrowserLang: jasmine.createSpy('getBrowserLang'),
      getBrowserCultureLang: jasmine.createSpy('getBrowserCultureLang'),
      use: jasmine.createSpy('use').and.returnValue(of({})),
      get: jasmine.createSpy('get').and.callFake(key => of(key.replace('#LDS#', '')))
    },
    userModelServiceStub: {
      getGroups: () => Promise.resolve([])
    },
    authenticationServiceStub: {
      onSessionResponse: new Subject()
    }
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ItshopPatternAddProductsComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      imports: [
        EuiCoreModule,
        MatCardModule,
        TranslateModule.forRoot({}),
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sidesheetData,
        },
        {
          provide: EuiLoadingService,
          useValue: testHelper.euiLoadingServiceStub
        },
        {
          provide: CartItemsService,
          useValue: testHelper.cartItemsServiceStub
        },
        {
          provide: EntityService,
          useValue: testHelper.entityServiceStub
        },
        {
          provide: ItshopPatternCreateService,
          useValue: testHelper.patterCreateServiceStub
        },
        {
          provide: ProjectConfigurationService,
          useValue: testHelper.projectConfigurationServiceStub
        },
        {
          provide: QerApiService,
          useValue: testHelper.qerApiServiceStub
        },
        {
          provide: EuiSidesheetRef,
          useValue: testHelper.sidesheetRefStub
        },
        {
          provide: EuiSidesheetService,
          useValue: testHelper.sidesheetServiceStub
        },
        {
          provide: ShelfService,
          useValue: testHelper.serviceItemsServiceStub
        },
        {
          provide: ServiceItemsService,
          useValue: testHelper.serviceItemsServiceStub
        },
        {
          provide: TranslateService,
          useValue: testHelper.translateServiceStub
        },
        {
          provide: UserModelService,
          useValue: testHelper.userModelServiceStub
        },
        {
          provide: AuthenticationService,
          useValue: testHelper.authenticationServiceStub
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItshopPatternAddProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
