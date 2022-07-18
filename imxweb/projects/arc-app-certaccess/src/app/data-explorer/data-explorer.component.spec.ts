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

import { ComponentFixture, flush, TestBed, fakeAsync } from '@angular/core/testing';
import { DataExplorerComponent } from './data-explorer.component';
import { ArcGovernanceTestBed } from '../../test/arc-governance-test-bed';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DeHelperService } from 'tsb';
import { DataIssuesService } from './data-issues/data-issues.service';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { UserModelService, IdentitiesService } from 'qer';

describe('DataExplorerComponent', () => {
  let component: DataExplorerComponent;
  let fixture: ComponentFixture<DataExplorerComponent>;

  const mockActivatedRoute = { snapshot: { paramMap: { get: (param) => ({}) } } };

  const mockUserModelService = {
    getGroups: () => {
      return Promise.resolve([]);
    },
  };

  ArcGovernanceTestBed.configureTestingModule({
    declarations: [DataExplorerComponent],
    imports: [
      NoopAnimationsModule,
      RouterTestingModule.withRoutes([
        {
          path: 'data/explorer',
          component: DataExplorerComponent,
        },
        {
          path: 'data/explorer/:tab',
          component: DataExplorerComponent,
        },
        {
          path: 'data/explorer/:tab/:issues',
          component: DataExplorerComponent,
        },
        {
          path: 'data/explorer/:tab/:issues/:mode',
          component: DataExplorerComponent,
        },
      ]),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
      DeHelperService,
      DataIssuesService,
      { provide: ActivatedRoute, useValue: mockActivatedRoute },
      { provide: UserModelService, useValue: mockUserModelService },
      {
        provide: IdentitiesService,
        useValue: {
          authorityDataDeleted: new Subject<string>()
        }
      },
    ],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit() tests', () => {
    let getAuthorityDataSpy: jasmine.Spy;
    let setupNavItemsSpy: jasmine.Spy;
    beforeEach(() => {
      getAuthorityDataSpy = spyOn(component['dataHelper'], 'getAuthorityData');
      setupNavItemsSpy = spyOn<any>(component, 'setupNavItems');
      spyOn(component['issues'], 'checkIssues').and.returnValue(of(undefined));
    });
    it('should not call to setup the navigation items when there are sync issues to display', fakeAsync(() => {
      getAuthorityDataSpy.and.returnValue(
        Promise.resolve({ hasAuthorities: true, authorities: [{ HasSync: { value: false }, HasData: { value: false } }] })
      );
      component.ngOnInit();
      flush();
      expect(setupNavItemsSpy).not.toHaveBeenCalled();
    }));
    it('should call to setup the navigation items when there is no sync status to display', fakeAsync(() => {
      getAuthorityDataSpy.and.returnValue(
        Promise.resolve({ hasAuthorities: true, authorities: [{ HasSync: { value: true }, HasData: { value: true } }] })
      );
      component.ngOnInit();
      flush();
      expect(setupNavItemsSpy).toHaveBeenCalled();
    }));
  });

  describe('onResize() tests', () => {
    beforeEach(() => jasmine.clock().install());
    afterEach(() => jasmine.clock().uninstall());

    [
      { isMobileValue: true, expectedValue: '58px' },
      { isMobileValue: false, expectedValue: '230px' },
    ].forEach((testcase) => {
      it(`should set the contentMargin to ${testcase.expectedValue} when isMobile is ${testcase.isMobileValue}`, () => {
        spyOnProperty(component, 'isMobile').and.returnValue(testcase.isMobileValue);
        component.onResize();
        jasmine.clock().tick(55);
        expect(component.contentMargin).toEqual(testcase.expectedValue);
      });
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
      component['hasSync'] = true;

      component.selectPage('groups');

      flush();

      expect(toggleMobileExpandSpy).not.toHaveBeenCalled();
      expect(component.selectedPage).toEqual('groups');
    }));

    it('should set the selectedPage and call toggleMobileExpand if isMobile', fakeAsync(() => {
      spyOnProperty(component, 'isMobile').and.returnValue(true);
      spyOn(mockActivatedRoute.snapshot.paramMap, 'get').and.returnValue('accounts');
      component['hasData'] = true;
      component['hasSync'] = true;

      component.selectPage('accounts');

      flush();

      expect(toggleMobileExpandSpy).toHaveBeenCalled();
      expect(component.selectedPage).toEqual('accounts');
    }));
  });

});
