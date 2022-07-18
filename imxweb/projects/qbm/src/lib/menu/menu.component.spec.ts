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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { MenuComponent } from './menu.component';
import { MenuItem } from './menu-item/menu-item.interface';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  const mockRouter = {
    config: [{ path: '1' }, { path: '2' }],
    navigate: jasmine.createSpy('navigate'),
    url: ''
  };

  const menuTriggerSpy = jasmine.createSpy('menuTriggerSpy');

  const menuData = {
    title: 't1',
    items: [
      {
        title: 't2',
        route: '/r2'
      },
      {
        title: 't3',
        route: '/r3'
      },
      {
        title: 't4',
        navigationCommands: {commands: ['/t4', {outlets: { primary: ['t41']}}]}
      }
    ]
  } as MenuItem;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [MenuComponent],
      imports: [
        LoggerTestingModule,
        MatMenuModule,
        MatTabsModule
      ],
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        }
      ]
    })
  });

  beforeEach(waitForAsync(() => {
    mockRouter.navigate.calls.reset();
    menuTriggerSpy.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TODO #227277 fix unittests after update on Angular V9
  [
    { // first check empty item
      activeRoute: '/rxxx',
      routeToCheck: undefined,
      expectedIsActive: false
    },
    { // then check with an route that not exists in the menu
      activeRoute: '/rxxx',
      routeToCheck: menuData,
      expectedIsActive: false
    },
    { // and last check with an existing route
      activeRoute: '/r2',
      routeToCheck: menuData,
      expectedIsActive: false
    }
  ].forEach(testcase =>
    xit('should set activeRoute to the active menu item', () => {
      mockRouter.url = testcase.activeRoute
      expect(component.isActive(testcase.routeToCheck)).toEqual(testcase.expectedIsActive);
    })
  );

  [
    {
      route: { path: undefined },
      expectedRouterNavigateCalls: 0,
      expectedTriggerCalls: 0
    },
    {
      route: mockRouter.config[0],
      expectedRouterNavigateCalls: 1,
      expectedTriggerCalls: 0
    },
    {
      route: mockRouter.config[0],
      trigger: () => menuTriggerSpy(),
      expectedRouterNavigateCalls: 0,
      expectedTriggerCalls: 1
    }
  ].forEach(testcase =>
    it('provides a navigation method', () => {
      component.navigate({ route: testcase.route.path, trigger: testcase.trigger } as MenuItem);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(testcase.expectedRouterNavigateCalls);
      expect(menuTriggerSpy).toHaveBeenCalledTimes(testcase.expectedTriggerCalls);
    })
  );
});
