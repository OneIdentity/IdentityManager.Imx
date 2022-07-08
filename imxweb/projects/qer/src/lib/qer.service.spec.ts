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

import { TestBed, inject } from '@angular/core/testing';
import { Type } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';

import { QerService } from './qer.service';
import { TwoFactorAuthenticationService, ExtService, MenuService, MenuFactory } from 'qbm';
import { ObjectSheetService } from './object-sheet/object-sheet.service';
import { ProjectConfig } from 'imx-api-qbm';

describe('QerService', () => {
  const twoFaRegisterSpy = jasmine.createSpy('register').and.callThrough();
  const extRegisterSpy = jasmine.createSpy('register').and.callThrough();
  const objectSheetsSpy = jasmine.createSpy('register').and.callThrough();

  const menuServiceStub = new class {
    private menuFactories: MenuFactory[] = [];

    reset() {
      this.menuFactories = [];
    }

    numOfRootMenus() {
      return this.menuFactories?.length ?? 0;
    }

    childMenus(preProps, groups) {
      return this.menuFactories.map(factory => factory(preProps, groups, {} as ProjectConfig));
    }

    readonly addMenuFactories = jasmine.createSpy('addMenuFactories').and.callFake((...factories: any[]) => {
      this.menuFactories.push(...factories);
    })
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        QerService,
        {
          provide: TwoFactorAuthenticationService,
          useClass: class {
            public register = twoFaRegisterSpy;
          }
        },
        {
          provide: ExtService,
          useClass: class {
            public register = extRegisterSpy;
          }
        },
        {
          provide: ObjectSheetService,
          useClass: class {
            public register = objectSheetsSpy;
          }
        },
        {
          provide: MenuService,
          useValue: menuServiceStub
        }
      ]
    });
  });

  beforeEach(() => {
    menuServiceStub.reset();
  });

  it('should be created', inject([QerService], (service: QerService) => {
    expect(service).toBeDefined();
  }));

  it('should register Starling as a 2FA provider and QBM_ops_ObjectOverview_Actions an extension service', inject(
    [QerService],
    (service: QerService) => {
      service.init();
      expect(twoFaRegisterSpy).toHaveBeenCalledWith('Starling', jasmine.any(Type));
      expect(extRegisterSpy).toHaveBeenCalledWith('QBM_ops_ObjectOverview_Actions', jasmine.any(Object));
      expect(objectSheetsSpy).toHaveBeenCalledWith('Person', jasmine.any(Type));
    }
  ));
});
