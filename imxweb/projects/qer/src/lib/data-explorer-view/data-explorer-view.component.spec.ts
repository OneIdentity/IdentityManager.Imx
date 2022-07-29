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

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, flush, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from 'ng-bullet';

import { DataExplorerViewComponent } from './data-explorer-view.component';
import { UserModelService } from '../user/user-model.service';
import { ClassloggerService, SystemInfoService } from 'qbm';

describe('DataExplorerViewComponent', () => {
  let component: DataExplorerViewComponent;
  let fixture: ComponentFixture<DataExplorerViewComponent>;

  const mockActivatedRoute = { snapshot: { paramMap: { get: (param) => ({}) } } };

  const mockUserModelService = {
    getGroups: () => {
      return Promise.resolve([]);
    },
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [DataExplorerViewComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([
          {
            path: 'admin/dataexplorer',
            component: DataExplorerViewComponent,
          },
          {
            path: 'admin/dataexplorer/:tab',
            component: DataExplorerViewComponent,
          },
        ]),
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: UserModelService, useValue: mockUserModelService },
        {
          provide: ClassloggerService,
          useValue: {
            debug: jasmine.createSpy('debug').and.callThrough()
          }
        },
        {
          provide: SystemInfoService,
          useValue: {
            get: jasmine.createSpy('get').and.callFake(() => Promise.resolve({
              PreProps: ['RISKINDEX']
            }))
          }
        },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataExplorerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit() tests', () => {
    let setupNavItemsSpy: jasmine.Spy;
    beforeEach(() => {
      setupNavItemsSpy = spyOn<any>(component, 'setupNavItems');
    });
    it('should call to setup the navigation items', fakeAsync(() => {
      component.ngOnInit();
      flush();
      expect(setupNavItemsSpy).toHaveBeenCalled();
    }));
  });

  describe('onResize() tests', () => {
    [
      { isMobileValue: true, expectedValue: '58px' },
      { isMobileValue: false, expectedValue: '230px' },
    ].forEach((testcase) => {
      it(`should set the contentMargin to ${testcase.expectedValue} when isMobile is ${testcase.isMobileValue}`, fakeAsync(() => {
        spyOnProperty(component, 'isMobile').and.returnValue(testcase.isMobileValue);
        component.onResize();
        tick(55);
        expect(component.contentMargin).toEqual(testcase.expectedValue);
      }));
    });
  });

  it('should toggle the mobileSideNavExpanded property state', () => {
    component.mobileSideNavExpanded = false;
    component.toggleMobileExpand();
    expect(component.mobileSideNavExpanded).toEqual(true);
  });

  describe('selectPage() tests', () => {
    let toggleMobileExpandSpy: jasmine.Spy;
    beforeEach(() => {
      toggleMobileExpandSpy = spyOn(component, 'toggleMobileExpand');
    });
    it('should set the selectedPage and not call toggleMobileExpand if not isMobile', fakeAsync(() => {
      spyOnProperty(component, 'isMobile').and.returnValue(false);
      spyOn(mockActivatedRoute.snapshot.paramMap, 'get').and.returnValue('groups');
      component['hasData'] = true;

      component.selectPage('groups');

      flush();

      expect(toggleMobileExpandSpy).not.toHaveBeenCalled();
      expect(component.selectedPage).toEqual('groups');
    }));

    it('should set the selectedPage and call toggleMobileExpand if isMobile', fakeAsync(() => {
      spyOnProperty(component, 'isMobile').and.returnValue(true);
      spyOn(mockActivatedRoute.snapshot.paramMap, 'get').and.returnValue('accounts');
      component['hasData'] = true;

      component.selectPage('accounts');

      flush();

      expect(toggleMobileExpandSpy).toHaveBeenCalled();
      expect(component.selectedPage).toEqual('accounts');
    }));
  });

});
